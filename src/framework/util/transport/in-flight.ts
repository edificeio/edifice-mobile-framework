/**
 * The signed requests that are running, by account: the ones to cancel when the session of the account ends.
 */

import { abortWith } from './abort';

interface SignedRequest {
  controller: AbortController;
  /** The session ended while the request was running: it was canceled for that reason. */
  endedBySession: boolean;
}

const inFlight = new Map<string, Set<SignedRequest>>();

/**
 * Registers a signed request of the account, to be canceled when its session ends.
 * @param callerSignal what the caller wants to cancel the request with, if anything.
 * @returns `signal` to give to the request (it aborts for the caller as well as for the end of the session),
 * `endedBySession()` to tell why it was aborted, and `done()` to call when the request is over (successfully or not).
 */
export const trackSignedRequest = (accountId: string, callerSignal?: AbortSignal | null) => {
  const request: SignedRequest = { controller: new AbortController(), endedBySession: false };
  const stopListening = abortWith(callerSignal, request.controller);
  let requests = inFlight.get(accountId);
  if (!requests) inFlight.set(accountId, (requests = new Set()));
  requests.add(request);
  return {
    done: () => {
      stopListening();
      requests.delete(request);
      if (requests.size === 0 && inFlight.get(accountId) === requests) inFlight.delete(accountId);
    },
    endedBySession: () => request.endedBySession,
    signal: request.controller.signal,
  };
};

/**
 * Cancels the signed requests of the account that are running now.
 * The ones started afterwards (the cleanup of the session, for instance) are not concerned.
 * @returns the number of requests that were canceled.
 */
export const abortSignedRequests = (accountId: string) => {
  const snapshot = [...(inFlight.get(accountId) ?? [])];
  for (const request of snapshot) {
    request.endedBySession = true;
    request.controller.abort();
  }
  return snapshot.length;
};
