import { abortSignedRequests, trackSignedRequest } from './in-flight';

describe('signed requests in flight', () => {
  it('aborts the running requests of the account only, and tells why', () => {
    const a1 = trackSignedRequest('a');
    const a2 = trackSignedRequest('a');
    const b = trackSignedRequest('b');
    expect(abortSignedRequests('a')).toBe(2);
    expect(a1.signal.aborted && a2.signal.aborted).toBe(true);
    expect(a1.endedBySession()).toBe(true);
    expect(b.signal.aborted).toBe(false);
    expect(b.endedBySession()).toBe(false);
    [a1, a2, b].forEach(r => r.done());
  });

  it('does not abort the requests that start afterwards', () => {
    const before = trackSignedRequest('a');
    abortSignedRequests('a');
    const after = trackSignedRequest('a');
    expect(after.signal.aborted).toBe(false);
    before.done();
    after.done();
  });

  it('forgets a request that is over', () => {
    trackSignedRequest('a').done();
    expect(abortSignedRequests('a')).toBe(0);
  });

  it('follows the signal of the caller without saying the session ended', () => {
    const caller = new AbortController();
    const request = trackSignedRequest('a', caller.signal);
    caller.abort();
    expect(request.signal.aborted).toBe(true);
    expect(request.endedBySession()).toBe(false);
    request.done();
  });
});
