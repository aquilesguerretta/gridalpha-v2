"""Simple dict + timestamp TTL cache for intelligence endpoints."""

import time
from typing import Any, Awaitable, Callable, TypeVar

T = TypeVar("T")

_store: dict[str, tuple[float, Any]] = {}


async def get_cached(
    key: str,
    ttl_seconds: float,
    factory: Callable[[], Awaitable[T]],
) -> T:
    now = time.time()
    hit = _store.get(key)
    if hit is not None and now - hit[0] < ttl_seconds:
        return hit[1]  # type: ignore[return-value]
    data = await factory()
    _store[key] = (now, data)
    return data
