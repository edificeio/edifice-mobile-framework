import { abortWith, isAbortError } from './abort';

const abortError = () => Object.assign(new Error('aborted'), { name: 'AbortError' });

describe('isAbortError', () => {
  it('recognizes an AbortError, also as the cause of another error', () => {
    expect(isAbortError(abortError())).toBe(true);
    expect(isAbortError(new Error('wrapper', { cause: abortError() }))).toBe(true);
  });
  it('rejects anything else', () => {
    expect(isAbortError(new Error('network'))).toBe(false);
    expect(isAbortError(undefined)).toBe(false);
    expect(isAbortError('AbortError')).toBe(false);
  });
});

describe('abortWith', () => {
  it('aborts the controller when the source aborts', () => {
    const source = new AbortController();
    const controller = new AbortController();
    abortWith(source.signal, controller);
    expect(controller.signal.aborted).toBe(false);
    source.abort();
    expect(controller.signal.aborted).toBe(true);
  });
  it('aborts at once when the source already aborted', () => {
    const source = new AbortController();
    source.abort();
    const controller = new AbortController();
    abortWith(source.signal, controller);
    expect(controller.signal.aborted).toBe(true);
  });
  it('does nothing without source', () => {
    const controller = new AbortController();
    abortWith(undefined, controller)();
    expect(controller.signal.aborted).toBe(false);
  });
  it('stops listening when asked to', () => {
    const source = new AbortController();
    const controller = new AbortController();
    abortWith(source.signal, controller)();
    source.abort();
    expect(controller.signal.aborted).toBe(false);
  });
});
