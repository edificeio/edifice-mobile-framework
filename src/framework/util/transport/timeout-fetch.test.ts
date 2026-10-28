import { FetchError, FetchErrorCode } from './error';
import { timeoutFetch } from './timeout-fetch';

jest.mock('./common', () => ({ MAX_FETCH_TIMEOUT_MS: 30000 }));

/** A fetch that never answers, and fails like the real one when its signal aborts. */
const hangingFetch = (async (_info, init) =>
  new Promise((_resolve, reject) => {
    const fail = () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    if (init?.signal?.aborted) fail();
    else init?.signal?.addEventListener('abort', fail);
  })) as typeof fetch;

describe('timeoutFetch', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns the response', async () => {
    const response = {} as Response;
    await expect(timeoutFetch((async () => response) as typeof fetch)('/x')).resolves.toBe(response);
  });

  it('throws TIMEOUT when the time is over', async () => {
    const outcome = timeoutFetch(hangingFetch, 1000)('/x').catch((e: unknown) => e);
    jest.advanceTimersByTime(1000);
    expect(await outcome).toMatchObject({ code: FetchErrorCode.TIMEOUT });
  });

  it('throws ABORTED (not TIMEOUT) when the caller aborts', async () => {
    const caller = new AbortController();
    const outcome = timeoutFetch(hangingFetch, 1000)('/x', { signal: caller.signal }).catch((e: unknown) => e);
    caller.abort();
    const error = await outcome;
    expect(error).toBeInstanceOf(FetchError);
    expect(error).toMatchObject({ code: FetchErrorCode.ABORTED });
  });

  it('throws ABORTED when the signal was already aborted', async () => {
    const caller = new AbortController();
    caller.abort();
    const error = await timeoutFetch(hangingFetch)('/x', { signal: caller.signal }).catch((e: unknown) => e);
    expect(error).toMatchObject({ code: FetchErrorCode.ABORTED });
  });

  it('lets other errors through', async () => {
    const error = new Error('boom');
    await expect(
      timeoutFetch((async () => {
        throw error;
      }) as typeof fetch)('/x'),
    ).rejects.toBe(error);
  });

  it('clears its timer once done', async () => {
    await timeoutFetch((async () => ({}) as Response) as typeof fetch)('/x');
    expect(jest.getTimerCount()).toBe(0);
  });
});
