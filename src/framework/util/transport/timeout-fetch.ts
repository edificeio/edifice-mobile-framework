import { abortWith, isAbortError } from './abort';
import { MAX_FETCH_TIMEOUT_MS } from './common';
import { FetchError, FetchErrorCode } from './error';

/**
 * Wraps a fetch function with a timeout mechanism, and with the cancellation of the caller.
 *
 * The request stops when the time is over, or when the `signal` of the caller aborts. The two are told apart:
 * - the time is over: `FetchError` `TIMEOUT`;
 * - the caller aborted: `FetchError` `ABORTED` (the canceled request is not a timeout).
 * Any other error is thrown as is.
 *
 * @param fetchFn - The fetch function to be wrapped.
 * @param timeoutMs - How long a request can last. Defaults to `MAX_FETCH_TIMEOUT_MS`.
 */
export const timeoutFetch =
  (fetchFn: typeof fetch, timeoutMs: number = MAX_FETCH_TIMEOUT_MS) =>
  async (info: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    const stopListening = abortWith(init?.signal, controller);
    try {
      return await fetchFn(info, { ...init, signal: controller.signal });
    } catch (e) {
      if (isAbortError(e)) {
        if (timedOut) throw new FetchError(FetchErrorCode.TIMEOUT, undefined, { cause: e });
        throw new FetchError(FetchErrorCode.ABORTED, undefined, { cause: e });
      }
      throw e;
    } finally {
      clearTimeout(timeout);
      stopListening();
    }
  };
