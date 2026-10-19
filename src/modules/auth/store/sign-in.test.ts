import { useSignInStore } from './sign-in';

const store = () => useSignInStore.getState();

const restoreStatus = { accountId: 'acc1', platform: 'platform', type: 'restore' } as const;

describe('sign-in store', () => {
  beforeEach(() => {
    useSignInStore.setState(useSignInStore.getInitialState(), true);
  });

  it('starts in a neutral situation: no status, no error', () => {
    expect(store().status).toBeUndefined();
    expect(store().error).toBeUndefined();
    expect(store().attempt).toBe(0);
  });

  describe('setStatus', () => {
    it('sets the status and counts the attempt', () => {
      store().setStatus(restoreStatus);
      expect(store().status).toEqual(restoreStatus);
      expect(store().attempt).toBe(1);
    });

    // The navigator resets itself on a new attempt, even when the status did not change (a second failed restore of the same account)
    it('counts the attempt even when the status is the same as before', () => {
      store().setStatus(restoreStatus);
      store().setStatus({ ...restoreStatus });
      expect(store().attempt).toBe(2);
    });

    it('clears the error', () => {
      store().setError({ info: new Error('failed') });
      store().setStatus(restoreStatus);
      expect(store().error).toBeUndefined();
    });

    it('can be an activation or a password renew code', () => {
      store().setStatus({ code: '123', loginUsed: 'login', platform: 'platform', type: 'activation' });
      expect(store().status?.type).toBe('activation');
      store().setStatus({ accountId: 'acc1', code: '456', loginUsed: 'login', platform: 'platform', type: 'passwordRenew' });
      expect(store().status?.type).toBe('passwordRenew');
      expect(store().attempt).toBe(2);
    });
  });

  describe('errors', () => {
    it('setError keeps the error and the key of the screen it belongs to', () => {
      const info = new Error('failed');
      store().setError({ info, key: 7 });
      expect(store().error).toEqual({ info, key: 7 });
    });

    it('consumeError gives the key of the screen that displays an error that had none', () => {
      store().setError({ info: new Error('failed') });
      store().consumeError(3);
      expect(store().error?.key).toBe(3);
    });

    it('consumeError does not take an error that already belongs to a screen', () => {
      store().setError({ info: new Error('failed'), key: 7 });
      store().consumeError(3);
      expect(store().error?.key).toBe(7);
    });

    it('consumeError does nothing without an error', () => {
      store().consumeError(3);
      expect(store().error).toBeUndefined();
    });

    it('clearError removes the error and nothing else', () => {
      store().setStatus(restoreStatus);
      store().setError({ info: new Error('failed') });
      store().clearError();
      expect(store().error).toBeUndefined();
      expect(store().status).toEqual(restoreStatus);
    });
  });

  describe('reset', () => {
    it('goes back to the neutral situation, but keeps counting the attempts', () => {
      store().setStatus(restoreStatus);
      store().setError({ info: new Error('failed') });
      store().reset();
      expect(store().status).toBeUndefined();
      expect(store().error).toBeUndefined();
      expect(store().attempt).toBe(1);
    });
  });
});
