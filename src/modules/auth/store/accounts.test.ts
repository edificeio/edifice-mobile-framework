import { createActiveAccount, createSavedAccount } from '~/test-utils/auth-accounts';

import { accountIsActive, accountIsLoggable, AuthRequirement } from '../model';
import {
  assertSession,
  getAccountWithRequirement,
  getActiveAccount,
  getSession,
  selectAccountWithRequirement,
  selectAuthStage,
  selectSession,
  useAccountsStore,
} from './accounts';

const store = () => useAccountsStore.getState();

describe('accounts store', () => {
  beforeEach(() => {
    useAccountsStore.setState(useAccountsStore.getInitialState(), true);
  });

  describe('initial state', () => {
    it('has no account, nobody connected, and the welcome screen to show', () => {
      expect(store().accounts).toEqual({});
      expect(store().connected).toBeUndefined();
      expect(store().showWelcome).toBe(true);
      expect(selectAuthStage(store())).toBe('signedOut');
    });
  });

  describe('hydrate', () => {
    it('replaces the accounts and the welcome flag, and forgets who was connected or deleted', () => {
      store().setAccount(createActiveAccount({ id: 'old' }));
      store().removeAccount('old');
      store().hydrate({ saved: createSavedAccount({ id: 'saved' }) }, false);
      expect(Object.keys(store().accounts)).toEqual(['saved']);
      expect(store().showWelcome).toBe(false);
      expect(store().connected).toBeUndefined();
      expect(store().lastDeletedAccount).toBeUndefined();
    });
  });

  describe('setAccount', () => {
    it('adds the account and makes it the connected one', () => {
      store().setAccount(createActiveAccount({ id: 'a' }));
      expect(store().connected).toBe('a');
      expect(accountIsActive(store().accounts.a)).toBe(true);
    });

    it('never shows the welcome screen again', () => {
      store().setAccount(createActiveAccount());
      expect(store().showWelcome).toBe(false);
      store().removeAccount('acc1');
      expect(store().showWelcome).toBe(false);
    });

    it('keeps the other accounts', () => {
      store().hydrate({ other: createSavedAccount({ id: 'other' }) }, true);
      store().setAccount(createActiveAccount({ id: 'a' }));
      expect(Object.keys(store().accounts).sort()).toEqual(['a', 'other']);
    });

    describe('addTimestamp (the display order)', () => {
      it('is the time of the sign-in for an account that was not among the accounts', () => {
        store().setAccount(createActiveAccount({ addTimestamp: 1, id: 'new', logTimestamp: 5000 }));
        expect(store().accounts.new.addTimestamp).toBe(5000);
      });

      it('stays the one of an account that is already among the accounts', () => {
        store().hydrate({ a: createSavedAccount({ addTimestamp: 42, id: 'a' }) }, true);
        store().setAccount(createActiveAccount({ id: 'a', logTimestamp: 9000 }));
        expect(store().accounts.a.addTimestamp).toBe(42);
      });
    });

    describe('replacing an account', () => {
      it('removes the account that is replaced', () => {
        store().hydrate({ old: createSavedAccount({ id: 'old' }) }, true);
        store().setAccount(createActiveAccount({ id: 'new' }), 'old');
        expect(Object.keys(store().accounts)).toEqual(['new']);
      });

      it('keeps one account when it replaces itself', () => {
        store().setAccount(createActiveAccount({ id: 'a', logTimestamp: 100 }));
        store().setAccount(createActiveAccount({ id: 'a', logTimestamp: 200 }), 'a');
        expect(Object.keys(store().accounts)).toEqual(['a']);
        expect(store().accounts.a.addTimestamp).toBe(100);
      });
    });

    describe('lastAddAccount', () => {
      beforeEach(() => {
        jest.spyOn(Date, 'now').mockReturnValue(123456);
      });

      it('is renewed when an account is added', () => {
        store().setAccount(createActiveAccount());
        expect(store().lastAddAccount).toBe(123456);
      });

      it('is not renewed when an account replaces another one', () => {
        store().setAccount(createActiveAccount({ id: 'a' }));
        jest.spyOn(Date, 'now').mockReturnValue(999999);
        store().setAccount(createActiveAccount({ id: 'a' }), 'a');
        expect(store().lastAddAccount).toBe(123456);
      });
    });

    it('forgets the last account that was removed', () => {
      store().hydrate({ a: createSavedAccount({ id: 'a' }) }, true);
      store().removeAccount('a');
      expect(store().lastDeletedAccount).toBe('a');
      store().setAccount(createActiveAccount({ id: 'b' }));
      expect(store().lastDeletedAccount).toBeUndefined();
    });
  });

  describe('stages and session', () => {
    it('is signed out without a connected account', () => {
      expect(selectAuthStage(store())).toBe('signedOut');
      expect(getActiveAccount()).toBeUndefined();
      expect(getSession()).toBeUndefined();
      expect(getAccountWithRequirement()).toBeUndefined();
    });

    it('is signed in with a connected account that has no requirement: it gives the session', () => {
      store().setAccount(createActiveAccount({ id: 'a' }));
      expect(selectAuthStage(store())).toBe('signedIn');
      expect(getSession()?.user.id).toBe('a');
      expect(getAccountWithRequirement()).toBeUndefined();
    });

    it('is at the requirement stage with a requirement: there is no session, the account is the one with a requirement', () => {
      store().setAccount(createActiveAccount({ id: 'a', requirement: AuthRequirement.MUST_CHANGE_PASSWORD }));
      expect(selectAuthStage(store())).toBe('requirement');
      expect(getSession()).toBeUndefined();
      expect(getActiveAccount()?.user.id).toBe('a');
      expect(getAccountWithRequirement()?.requirement).toBe(AuthRequirement.MUST_CHANGE_PASSWORD);
    });

    it('has no connected account, so no session, when the connected id is of a saved account', () => {
      store().hydrate({ a: createSavedAccount({ id: 'a' }) }, true);
      useAccountsStore.setState({ connected: 'a' });
      expect(selectSession(store())).toBeUndefined();
      expect(selectAccountWithRequirement(store())).toBeUndefined();
      expect(selectAuthStage(store())).toBe('signedOut');
    });

    it('asserts the session: it throws without one', () => {
      expect(() => assertSession()).toThrow('no session');
      store().setAccount(createActiveAccount({ id: 'a' }));
      expect(assertSession().user.id).toBe('a');
    });
  });

  describe('logout', () => {
    it('disconnects the account and keeps it without its tokens', () => {
      store().setAccount(createActiveAccount({ id: 'a' }));
      store().logout();
      expect(store().connected).toBeUndefined();
      expect(store().accounts.a).toBeDefined();
      expect(accountIsLoggable(store().accounts.a)).toBe(false);
      expect(accountIsActive(store().accounts.a)).toBe(false);
    });

    it('does nothing without a connected account', () => {
      store().hydrate({ a: createSavedAccount({ id: 'a' }) }, true);
      const accounts = store().accounts;
      store().logout();
      expect(store().accounts).toBe(accounts);
    });

    it('leaves the other accounts alone', () => {
      store().hydrate({ other: createSavedAccount({ id: 'other' }) }, true);
      store().setAccount(createActiveAccount({ id: 'a' }));
      store().logout();
      expect(accountIsLoggable(store().accounts.other)).toBe(true);
    });
  });

  describe('sleep', () => {
    it('disconnects the account and keeps its tokens, so it can be woken up', () => {
      store().setAccount(createActiveAccount({ id: 'a', tokens: { refresh: { value: 'keep me' } } }));
      store().sleep();
      expect(store().connected).toBeUndefined();
      const slept = store().accounts.a;
      expect(accountIsLoggable(slept)).toBe(true);
      expect(accountIsActive(slept)).toBe(false);
      expect(accountIsLoggable(slept) && slept.tokens.refresh.value).toBe('keep me');
    });

    it('does nothing without a connected account', () => {
      const accounts = store().accounts;
      store().sleep();
      expect(store().accounts).toBe(accounts);
    });
  });

  describe('removeAccount', () => {
    it('removes the account and remembers it was the last one removed', () => {
      store().hydrate({ a: createSavedAccount({ id: 'a' }), b: createSavedAccount({ id: 'b' }) }, true);
      store().removeAccount('a');
      expect(Object.keys(store().accounts)).toEqual(['b']);
      expect(store().lastDeletedAccount).toBe('a');
    });

    it('disconnects the account when it is the connected one', () => {
      store().setAccount(createActiveAccount({ id: 'a' }));
      store().removeAccount('a');
      expect(store().connected).toBeUndefined();
      expect(selectAuthStage(store())).toBe('signedOut');
    });

    it('keeps the connected account when another one is removed', () => {
      store().hydrate({ other: createSavedAccount({ id: 'other' }) }, true);
      store().setAccount(createActiveAccount({ id: 'a' }));
      store().removeAccount('other');
      expect(store().connected).toBe('a');
    });
  });

  describe('startup (what the app resumes at its next launch)', () => {
    const saved = (id: string) => ({ [id]: createSavedAccount({ id }) });

    it('is empty at first, and is what hydrate is given', () => {
      expect(store().startup).toEqual({});
      store().hydrate(saved('a'), true, { account: 'a', platform: 'platform' });
      expect(store().startup).toEqual({ account: 'a', platform: 'platform' });
      expect(store().connected).toBeUndefined();
    });

    it('becomes the account that signs in, with its platform', () => {
      store().setAccount(createActiveAccount({ id: 'a' }));
      expect(store().startup).toEqual({ account: 'a', platform: 'platform' });
    });

    it('moves to the account that replaces the connected one', () => {
      store().setAccount(createActiveAccount({ id: 'a' }));
      store().setAccount(createActiveAccount({ id: 'b' }), 'a');
      expect(store().startup).toEqual({ account: 'b', platform: 'platform' });
    });

    it('is emptied when the connected account logs out, or is put to sleep', () => {
      store().setAccount(createActiveAccount({ id: 'a' }));
      store().logout();
      expect(store().startup).toEqual({});
      store().setAccount(createActiveAccount({ id: 'b' }));
      store().sleep();
      expect(store().startup).toEqual({});
    });

    it('is not touched by a logout or a sleep when nobody is connected (a restore that failed at launch)', () => {
      store().hydrate(saved('a'), false, { account: 'a', platform: 'platform' });
      store().logout();
      store().sleep();
      expect(store().startup).toEqual({ account: 'a', platform: 'platform' });
    });

    it('is not touched by the tokens, the profile or the removal of another account', () => {
      store().hydrate({ ...saved('a'), ...saved('b') }, false, { account: 'a', platform: 'platform' });
      store().removeAccount('b');
      expect(store().startup).toEqual({ account: 'a', platform: 'platform' });
    });

    it('is lost with the account it points to, connected or not', () => {
      store().hydrate({ ...saved('a'), ...saved('b') }, false, { account: 'a', platform: 'platform' });
      store().removeAccount('a');
      expect(store().startup).toEqual({});
      store().setAccount(createActiveAccount({ id: 'c' }));
      store().removeAccount('c');
      expect(store().startup).toEqual({});
    });

    it('is only the platform of the last account, once it is removed', () => {
      store().hydrate(saved('a'), false, { account: 'a', platform: 'platform' });
      store().removeAccount('a');
      expect(store().startup).toEqual({ platform: 'platform' });
    });
  });

  describe('tokens', () => {
    it('refreshToken replaces the tokens of the account', () => {
      store().setAccount(createActiveAccount({ id: 'a' }));
      const tokens = { ...createActiveAccount().tokens, refresh: { value: 'new refresh' } };
      store().refreshToken('a', tokens);
      expect(getActiveAccount()?.tokens.refresh.value).toBe('new refresh');
    });

    it('setQueryParamToken, setOneSessionId and setCarbonioToken change only their token', () => {
      store().setAccount(createActiveAccount({ id: 'a' }));
      store().setQueryParamToken('a', { expiresAt: 'x', type: 'QueryParam', value: 'qp' });
      store().setOneSessionId('a', { value: 'sid' });
      store().setCarbonioToken('a', 'carbonio');
      const tokens = getActiveAccount()!.tokens;
      expect(tokens.queryParam?.value).toBe('qp');
      expect(tokens.oneSessionId?.value).toBe('sid');
      expect(tokens.carbonioToken).toBe('carbonio');
      expect(tokens.access.value).toBe('access');
    });

    it('are not set for an account that has no tokens (logged out), or an unknown one', () => {
      store().hydrate({ out: createSavedAccount({ id: 'out', loggedIn: false }) }, true);
      const accounts = store().accounts;
      store().setOneSessionId('out', { value: 'sid' });
      store().setOneSessionId('unknown', { value: 'sid' });
      expect(store().accounts).toBe(accounts);
    });
  });

  describe('profile and carbonio infos', () => {
    it('updateProfile merges the changes in the profile of the connected account', () => {
      store().setAccount(createActiveAccount({ id: 'a' }));
      store().updateProfile('a', { firstName: 'Changed' });
      expect(getActiveAccount()?.user.firstName).toBe('Changed');
      expect(getActiveAccount()?.user.lastName).toBe('Last');
    });

    it('updateProfile and setCarbonioUserInfos ignore an account that is not the active one', () => {
      store().hydrate({ saved: createSavedAccount({ id: 'saved' }) }, true);
      const accounts = store().accounts;
      store().updateProfile('saved', { firstName: 'Changed' });
      store().setCarbonioUserInfos('saved', {} as never);
      expect(store().accounts).toBe(accounts);
    });

    it('setCarbonioUserInfos stores the infos in the active account', () => {
      store().setAccount(createActiveAccount({ id: 'a' }));
      store().setCarbonioUserInfos('a', { name: 'mail' } as never);
      expect(getActiveAccount()?.carbonioUserInfos).toEqual({ name: 'mail' });
    });
  });
});
