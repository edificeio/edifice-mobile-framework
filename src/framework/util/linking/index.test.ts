import { Alert, type AlertButton, Linking } from 'react-native';

import Toast from '~/framework/components/toast';
import { refreshQueryParamToken } from '~/modules/auth/flows/refresh-query-param-token';
import { AuthRequirement } from '~/modules/auth/model';
import { useAccountsStore } from '~/modules/auth/store/accounts';
import { createActiveAccount } from '~/test-utils/auth-accounts';
import '~/test-utils/app-conf';

import { openUrl, openUrlAsync } from '.';

jest.mock('react-native', () => ({ Alert: { alert: jest.fn() }, Linking: { openURL: jest.fn() } }));
jest.mock('~/util/i18n', () => ({ I18n: { get: (key: string) => key } }));
jest.mock('~/app/navigation', () => ({ navigationRef: { dispatch: jest.fn() } }));
jest.mock('~/framework/modules/nabook/navigation/', () => ({ nabookRouteNames: { home: 'nabook/home' } }));
jest.mock('~/framework/util/notifications/routing', () => ({ handleNotificationNavigationAction: jest.fn() }));
jest.mock('~/framework/components/toast', () => ({ __esModule: true, default: { showError: jest.fn() } }));
jest.mock('~/modules/auth/flows/refresh-query-param-token', () => ({ refreshQueryParamToken: jest.fn() }));

const PLATFORM = 'https://platform.test';

const connect = (requirement?: AuthRequirement) => {
  const account = createActiveAccount({ requirement });
  useAccountsStore.getState().setAccount(account);
  return account;
};

/** The user answers the next confirmation alert by pressing its button of this style. */
const answer = (style: 'cancel' | 'default') =>
  jest.mocked(Alert.alert).mockImplementationOnce((_title, _message, buttons?: AlertButton[]) => {
    buttons?.find(button => button.style === style)?.onPress?.();
  });

/** Waits until the promises started by `openUrl` are settled. */
const flushPromises = () => new Promise(resolve => setImmediate(resolve));

beforeEach(() => {
  useAccountsStore.setState(useAccountsStore.getInitialState(), true);
  jest.mocked(Linking.openURL).mockResolvedValue(undefined);
  jest
    .mocked(refreshQueryParamToken)
    .mockResolvedValue({ expiresAt: '2100-01-01T00:00:00.000Z', type: 'QueryParam', value: 'qpt' });
});

describe('openUrlAsync', () => {
  it('adds the query param token to the urls of the platform of the connected account', async () => {
    const account = connect();
    answer('default');
    await expect(openUrlAsync(`${PLATFORM}/blog`)).resolves.toBe(true);
    expect(refreshQueryParamToken).toHaveBeenCalledWith(account);
    expect(Linking.openURL).toHaveBeenCalledWith(`${PLATFORM}/blog?queryparam_token=qpt`);
  });

  it('logs in the connected account even if it still has a requirement to fulfil', async () => {
    connect(AuthRequirement.MUST_REVALIDATE_TERMS);
    await openUrlAsync(`${PLATFORM}/blog`, { confirmation: false });
    expect(Linking.openURL).toHaveBeenCalledWith(`${PLATFORM}/blog?queryparam_token=qpt`);
  });

  it('resolves the relative urls on the platform of the connected account', async () => {
    connect();
    await openUrlAsync('/blog', { confirmation: false });
    expect(Linking.openURL).toHaveBeenCalledWith(`${PLATFORM}/blog?queryparam_token=qpt`);
  });

  it.each([
    ['another origin', 'https://elsewhere.test/page'],
    ['an origin that only starts like the platform', 'https://platform.test.evil.com/page'],
  ])('opens an url of %s without token', async (_case, url) => {
    connect();
    await openUrlAsync(url, { confirmation: false });
    expect(refreshQueryParamToken).not.toHaveBeenCalled();
    expect(Linking.openURL).toHaveBeenCalledWith(url);
  });

  it('opens an absolute url without token when nobody is connected', async () => {
    await expect(openUrlAsync(`${PLATFORM}/blog`, { confirmation: false })).resolves.toBe(true);
    expect(refreshQueryParamToken).not.toHaveBeenCalled();
    expect(Linking.openURL).toHaveBeenCalledWith(`${PLATFORM}/blog`);
  });

  it('rejects a relative url when nobody is connected', async () => {
    await expect(openUrlAsync('/blog', { confirmation: false })).rejects.toThrow();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('rejects an invalid url', async () => {
    await expect(openUrlAsync('not an url', { confirmation: false })).rejects.toThrow();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('opens the url without token when the token cannot be obtained', async () => {
    connect();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.mocked(refreshQueryParamToken).mockRejectedValue(new Error('network'));
    await expect(openUrlAsync(`${PLATFORM}/blog`, { confirmation: false })).resolves.toBe(true);
    expect(Linking.openURL).toHaveBeenCalledWith(`${PLATFORM}/blog`);
  });

  it('resolves false and opens nothing when the user cancels', async () => {
    connect();
    answer('cancel');
    await expect(openUrlAsync(`${PLATFORM}/blog`)).resolves.toBe(false);
    expect(refreshQueryParamToken).not.toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('shows the given texts in the confirmation, the default ones otherwise', async () => {
    answer('default');
    await openUrlAsync('https://elsewhere.test', { confirmation: { continue: 'Go', title: 'Title' } });
    const [title, message, buttons] = jest.mocked(Alert.alert).mock.calls[0];
    expect(title).toBe('Title');
    expect(message).toBe('linking-redirectbrowser-message');
    expect(buttons?.map(button => button.text)).toEqual(['common-cancel', 'Go']);
  });

  it('asks nothing when the confirmation is false', async () => {
    await openUrlAsync('https://elsewhere.test', { confirmation: false });
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(Linking.openURL).toHaveBeenCalled();
  });

  it('rejects when the url cannot be open', async () => {
    jest.mocked(Linking.openURL).mockRejectedValue(new Error('unsupported'));
    await expect(openUrlAsync('unknown://scheme', { confirmation: false })).rejects.toThrow('unsupported');
  });
});

describe('openUrl', () => {
  const callbacks = () => ({ onCancel: jest.fn(), onError: jest.fn(), onSuccess: jest.fn() });

  it('calls onSuccess once the url is open', async () => {
    const options = callbacks();
    openUrl('https://elsewhere.test', { confirmation: false, ...options });
    await flushPromises();
    expect(options.onSuccess).toHaveBeenCalled();
    expect(options.onCancel).not.toHaveBeenCalled();
    expect(Toast.showError).not.toHaveBeenCalled();
  });

  it('calls onCancel when the user cancels', async () => {
    const options = callbacks();
    answer('cancel');
    openUrl('https://elsewhere.test', options);
    await flushPromises();
    expect(options.onCancel).toHaveBeenCalled();
    expect(options.onSuccess).not.toHaveBeenCalled();
  });

  it('shows an error toast and calls onError when the url cannot be open', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('unsupported');
    jest.mocked(Linking.openURL).mockRejectedValue(error);
    const options = callbacks();
    openUrl('unknown://scheme', { confirmation: false, errorText: 'Oops', ...options });
    await flushPromises();
    expect(Toast.showError).toHaveBeenCalledWith('Oops');
    expect(options.onError).toHaveBeenCalledWith(error);
    expect(options.onSuccess).not.toHaveBeenCalled();
  });

  it('shows the default error text', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    openUrl('/blog', { confirmation: false });
    await flushPromises();
    expect(Toast.showError).toHaveBeenCalledWith('linking-redirectbrowser-error');
  });
});
