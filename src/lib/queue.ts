/**
 * src/lib/queue.ts
 *
 * Singleton PQueue instance for serializing Groq API calls.
 * Concurrency is set to 1 to avoid hitting TPM rate limits.
 *
 * Hot-reload safety: In Next.js dev mode the module cache is cleared on every
 * file save, which would ordinarily create a new PQueue on each reload and
 * lose all in-flight tasks. We store the queue on `globalThis` so it persists
 * across hot-reloads while still being typed correctly.
 */

import PQueue from "p-queue";

// Extend globalThis with our typed queue property
declare global {
  // eslint-disable-next-line no-var
  var __groqQueue: PQueue | undefined;
}

function createQueue(): PQueue {
  return new PQueue({ concurrency: 1 });
}

// Re-use existing queue in dev hot-reloads; always create fresh in production
const queue: PQueue =
  process.env.NODE_ENV === "development"
    ? (globalThis.__groqQueue ?? (globalThis.__groqQueue = createQueue()))
    : createQueue();

export default queue;

