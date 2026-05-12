"""SSE stream hub for ``/api/stream``.

A single ``StreamHub`` instance owns:

  * a set of subscriber ``asyncio.Queue`` objects
  * a ``poller`` background task that wakes every 5 minutes (matching
    PJM's RT 5-min interval) and broadcasts ``lmp-update`` and
    ``outage`` events to every subscriber
  * a ``heartbeat`` background task that emits ``heartbeat`` every 30s

The hub is started/stopped from FastAPI lifespan handlers in
``app.main``. Each ``/api/stream`` connection registers a queue via
``subscribe()`` and unregisters in the generator's ``finally`` block so
slow clients do not back up the broadcast.

Event payload schemas mirror the contract in
``docs/v2-backend-contract.md``::

    event: lmp-update
    data:  {"zone": "...", "lmp_total": ..., "timestamp": "...", ...}

    event: outage
    data:  {"generator": "...", "zone": "...", "capacity_mw": ..., "event": "start", "timestamp": "..."}

    event: heartbeat
    data:  {"timestamp": "..."}
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, AsyncIterator

from app.services.envelope import utc_now_iso
from app.services.pjm_lmp import get_lmp_all_zones
from app.services.pjm_outages_v2 import get_outages_current

LOG = logging.getLogger("gridalpha.stream")

POLL_INTERVAL_SECONDS = 300  # 5 minutes (PJM RT cadence)
HEARTBEAT_INTERVAL_SECONDS = 30
QUEUE_MAX_SIZE = 256

# A single SSE frame as the EventSourceResponse expects it.
StreamFrame = dict[str, Any]


class StreamHub:
    """In-process SSE pub/sub hub.

    Not safe across processes - each Railway replica runs its own hub.
    For Wave 5 the V2 backend deploys as a single uvicorn worker so this
    is fine; if the deployment scales out, swap the in-process queue for
    Redis pub/sub without touching the connection generator.
    """

    def __init__(self) -> None:
        self._subs: set[asyncio.Queue[StreamFrame]] = set()
        self._lock = asyncio.Lock()
        self._poll_task: asyncio.Task[None] | None = None
        self._hb_task: asyncio.Task[None] | None = None
        self._last_lmp_snapshot: dict[str, float] = {}
        self._last_outage_keys: set[str] = set()

    # ── lifecycle ───────────────────────────────────────────────────────────

    async def start(self) -> None:
        if self._poll_task is None:
            self._poll_task = asyncio.create_task(self._poll_loop(), name="pjm-poll")
        if self._hb_task is None:
            self._hb_task = asyncio.create_task(
                self._heartbeat_loop(), name="pjm-heartbeat"
            )

    async def stop(self) -> None:
        for task in (self._poll_task, self._hb_task):
            if task is None:
                continue
            task.cancel()
            try:
                await task
            except (asyncio.CancelledError, Exception):
                pass
        self._poll_task = None
        self._hb_task = None
        async with self._lock:
            self._subs.clear()

    # ── subscriber API ─────────────────────────────────────────────────────

    async def subscribe(self) -> asyncio.Queue[StreamFrame]:
        q: asyncio.Queue[StreamFrame] = asyncio.Queue(maxsize=QUEUE_MAX_SIZE)
        async with self._lock:
            self._subs.add(q)
        # Send a hello frame immediately so newly-connected clients
        # see the live channel before the first poll.
        await q.put(
            {
                "event": "heartbeat",
                "data": json.dumps(
                    {"timestamp": utc_now_iso(), "phase": "connected"}
                ),
            }
        )
        return q

    async def unsubscribe(self, q: asyncio.Queue[StreamFrame]) -> None:
        async with self._lock:
            self._subs.discard(q)

    @property
    def subscriber_count(self) -> int:
        return len(self._subs)

    # ── broadcast ──────────────────────────────────────────────────────────

    async def _broadcast(self, frame: StreamFrame) -> None:
        async with self._lock:
            subs = list(self._subs)
        for q in subs:
            try:
                q.put_nowait(frame)
            except asyncio.QueueFull:
                # Slow consumer: drop the oldest message to keep the
                # stream live for everyone else.
                try:
                    q.get_nowait()
                    q.put_nowait(frame)
                except (asyncio.QueueEmpty, asyncio.QueueFull):
                    pass

    # ── pollers ────────────────────────────────────────────────────────────

    async def _poll_once(self) -> None:
        try:
            lmp_envelope = await get_lmp_all_zones()
        except Exception as exc:  # noqa: BLE001 - keep loop alive
            LOG.warning("lmp poll failed: %s", exc)
        else:
            ts = lmp_envelope.get("meta", {}).get("timestamp") or utc_now_iso()
            zones = lmp_envelope.get("data") or {}
            for zone_id, payload in zones.items():
                lmp_total = float(payload.get("lmp_total") or 0.0)
                prev = self._last_lmp_snapshot.get(zone_id)
                if prev is not None and abs(prev - lmp_total) < 0.01:
                    continue
                self._last_lmp_snapshot[zone_id] = lmp_total
                await self._broadcast(
                    {
                        "event": "lmp-update",
                        "data": json.dumps(
                            {
                                "zone": zone_id,
                                "lmp_total": lmp_total,
                                "delta_pct_5min": payload.get("delta_pct_5min"),
                                "timestamp": ts,
                                "data_age_seconds": lmp_envelope.get("meta", {}).get(
                                    "data_age_seconds"
                                ),
                            }
                        ),
                    }
                )

        try:
            outage_envelope = await get_outages_current()
        except Exception as exc:  # noqa: BLE001 - keep loop alive
            LOG.warning("outage poll failed: %s", exc)
            return

        rows = outage_envelope.get("data") or []
        seen_keys: set[str] = set()
        ts = outage_envelope.get("meta", {}).get("timestamp") or utc_now_iso()
        for row in rows:
            key = (
                f"{row.get('generator', '')}|{row.get('start_timestamp', '')}"
            )
            seen_keys.add(key)
            if key in self._last_outage_keys:
                continue
            await self._broadcast(
                {
                    "event": "outage",
                    "data": json.dumps(
                        {
                            "generator": row.get("generator"),
                            "zone": row.get("zone"),
                            "capacity_mw": row.get("capacity_mw"),
                            "outage_type": row.get("outage_type"),
                            "fuel_type": row.get("fuel_type"),
                            "event": "start",
                            "timestamp": ts,
                        }
                    ),
                }
            )

        # Surface clears (events that disappeared since last poll).
        cleared = self._last_outage_keys - seen_keys
        for key in cleared:
            generator, _, _ts = key.partition("|")
            await self._broadcast(
                {
                    "event": "outage",
                    "data": json.dumps(
                        {
                            "generator": generator,
                            "event": "end",
                            "timestamp": ts,
                        }
                    ),
                }
            )
        self._last_outage_keys = seen_keys

    async def _poll_loop(self) -> None:
        # Best-effort initial poll so the first subscriber gets data fast.
        try:
            await asyncio.sleep(2.0)
            await self._poll_once()
        except asyncio.CancelledError:
            raise
        except Exception as exc:  # noqa: BLE001
            LOG.warning("initial poll failed: %s", exc)

        while True:
            try:
                await asyncio.sleep(POLL_INTERVAL_SECONDS)
                await self._poll_once()
            except asyncio.CancelledError:
                break
            except Exception as exc:  # noqa: BLE001 - never let loop die
                LOG.warning("poll iteration failed: %s", exc)

    async def _heartbeat_loop(self) -> None:
        while True:
            try:
                await asyncio.sleep(HEARTBEAT_INTERVAL_SECONDS)
                if self._subs:
                    await self._broadcast(
                        {
                            "event": "heartbeat",
                            "data": json.dumps({"timestamp": utc_now_iso()}),
                        }
                    )
            except asyncio.CancelledError:
                break


# Module-level singleton; main.py wires its lifecycle.
HUB = StreamHub()


async def event_generator(q: asyncio.Queue[StreamFrame]) -> AsyncIterator[StreamFrame]:
    """Yield SSE frames from a subscriber queue."""
    try:
        while True:
            frame = await q.get()
            yield frame
    except asyncio.CancelledError:
        return
