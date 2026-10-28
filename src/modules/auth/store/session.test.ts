import { createSessionStore, registerSessionReset, resetSessionStores } from './session';

describe('session stores', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('go back to their initial state when the session ends', () => {
    const useStore = createSessionStore<{ apps: string[]; setApps: (apps: string[]) => void }>(set => ({
      apps: [],
      setApps: apps => set({ apps }),
    }));
    useStore.getState().setApps(['mails']);
    expect(useStore.getState().apps).toEqual(['mails']);
    resetSessionStores();
    expect(useStore.getState().apps).toEqual([]);
  });

  it('also flush what registered its own reset, and a reset that fails does not stop the others', () => {
    const flushed = jest.fn();
    registerSessionReset(() => {
      throw new Error('broken');
    });
    registerSessionReset(flushed);
    resetSessionStores();
    expect(flushed).toHaveBeenCalledTimes(1);
  });
});
