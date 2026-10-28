import { Alert } from 'react-native';

import { createConfirmRemoveAccount } from './remove-account';

jest.mock('react-native', () => ({ Alert: { alert: jest.fn() } }));
jest.mock('~/util/i18n', () => ({ I18n: { get: (key: string) => key } }));

type AlertButton = { onPress?: () => void; style?: string; text?: string };
const alert = Alert.alert as jest.Mock;
const button = (predicate: (button: AlertButton) => boolean) => (alert.mock.calls[0][2] as AlertButton[]).find(predicate);
const options = () => alert.mock.calls[0][3] as { onDismiss: () => void };

describe('confirmRemoveAccount', () => {
  const removeAccount = jest.fn();
  const confirmRemoveAccount = createConfirmRemoveAccount(removeAccount);
  const account = { user: { id: 'a' } } as never;

  beforeEach(() => {
    removeAccount.mockReset().mockResolvedValue(undefined);
    alert.mockClear();
  });

  it('asks before removing anything', () => {
    confirmRemoveAccount(account).catch(() => {});
    expect(alert).toHaveBeenCalledTimes(1);
    expect(removeAccount).not.toHaveBeenCalled();
  });

  it('removes the account when confirmed, after `beforeRemove`, and tells it', async () => {
    const calls: string[] = [];
    removeAccount.mockImplementation(async () => {
      calls.push('remove');
    });
    const result = confirmRemoveAccount(account, {
      beforeRemove: () => {
        calls.push('before');
      },
    });
    button(b => b.style === 'destructive')?.onPress?.();
    expect(await result).toBe(true);
    expect(calls).toEqual(['before', 'remove']);
    expect(removeAccount).toHaveBeenCalledWith(account);
  });

  it('does nothing when cancelled, and tells it', async () => {
    const beforeRemove = jest.fn();
    const result = confirmRemoveAccount(account, { beforeRemove });
    button(b => b.text === 'common-cancel')?.onPress?.();
    expect(await result).toBe(false);
    expect(beforeRemove).not.toHaveBeenCalled();
    expect(removeAccount).not.toHaveBeenCalled();
  });

  it('does nothing when the question is dismissed, and tells it', async () => {
    const result = confirmRemoveAccount(account);
    options().onDismiss();
    expect(await result).toBe(false);
    expect(removeAccount).not.toHaveBeenCalled();
  });

  it('throws the error of the removal', async () => {
    removeAccount.mockRejectedValue(new Error('nope'));
    const result = confirmRemoveAccount(account);
    button(b => b.style === 'destructive')?.onPress?.();
    await expect(result).rejects.toThrow('nope');
  });
});
