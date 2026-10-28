import { Alert } from 'react-native';

import { createConfirmLogout } from './logout';

jest.mock('react-native', () => ({ Alert: { alert: jest.fn() } }));
jest.mock('~/util/i18n', () => ({ I18n: { get: (key: string) => key } }));

describe('confirmLogout', () => {
  const logout = jest.fn();
  const alert = Alert.alert as jest.Mock;
  const confirmLogout = createConfirmLogout(logout);

  beforeEach(() => {
    logout.mockClear();
    alert.mockClear();
  });

  it('asks before doing anything', () => {
    confirmLogout();
    expect(alert).toHaveBeenCalledTimes(1);
    expect(logout).not.toHaveBeenCalled();
  });

  it('does not log out when cancelled', () => {
    confirmLogout();
    const cancel = alert.mock.calls[0][2]?.find((button: { text?: string }) => button.text === 'common-cancel');
    expect(cancel?.onPress).toBeUndefined();
    expect(logout).not.toHaveBeenCalled();
  });

  it('logs out when confirmed', () => {
    confirmLogout();
    alert.mock.calls[0][2]?.find((button: { style?: string }) => button.style === 'destructive')?.onPress?.();
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
