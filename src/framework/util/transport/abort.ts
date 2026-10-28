/**
 * Helpers to cancel requests: what makes a request stop, and who asked.
 */

/** Does the error (or its deepest cause) come from a canceled request? */
export const isAbortError = (e: unknown) => {
  let current = e;
  while (current instanceof global.Error && current.cause !== undefined) current = current.cause;
  return current instanceof global.Error && current.name === 'AbortError';
};

/**
 * Makes `controller` abort when `source` aborts (at once if it already did).
 * @returns a function that stops listening: call it when the request is over.
 */
export const abortWith = (source: AbortSignal | null | undefined, controller: AbortController) => {
  if (!source) return () => {};
  if (source.aborted) {
    controller.abort();
    return () => {};
  }
  const onAbort = () => controller.abort();
  source.addEventListener('abort', onAbort, { once: true });
  return () => source.removeEventListener('abort', onAbort);
};
