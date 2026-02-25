/**
 * GridAlpha V2 — Agent artifact envelope.
 *
 * Every agent (Atlas, Nest, Data) wraps its output in this generic shape
 * so the orchestrator can route, version, and timestamp artefacts uniformly.
 */

/** Generic wrapper produced by any GridAlpha agent. */
export interface AgentArtifact<T> {
  /** Which agent produced this artifact. */
  agent_id: "atlas" | "nest" | "data";

  /** Semantic version of the agent that emitted the artifact. */
  version: string;

  /** The typed payload specific to the agent. */
  payload: T;

  /** ISO-8601 UTC timestamp of artifact creation. */
  timestamp: string;
}
