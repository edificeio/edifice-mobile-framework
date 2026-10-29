import type { ImageURISource } from 'react-native';

import '~/test-utils/app-conf';

import { createActiveAccount } from '~/test-utils/auth-accounts';

import { resolveUrl, signSource } from './source';

jest.mock('~/framework/util/tracker', () => ({ Trackers: { trackDebugEvent: jest.fn() } }));
// The headers of the device (the same for every request)
jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: { getBundleId: () => 'bundle', getReadableVersion: () => '1.0.0' },
  getDeviceId: () => 'device',
}));

// The platform of the accounts of the tests (see `createActiveAccount`)
const PLATFORM_URL = 'https://platform.test';
const account = createActiveAccount();
const authorization = { Authorization: 'Bearer access' };
const sign = (source: ImageURISource) => signSource(account, source);

describe('signSource', () => {
  it('signs a source of the platform of the account', () => {
    expect(sign({ uri: `${PLATFORM_URL}/workspace/document/1` })).toEqual({
      headers: expect.objectContaining(authorization),
      uri: `${PLATFORM_URL}/workspace/document/1`,
    });
  });

  it('gives the domain of the platform to an url that has none, and signs it', () => {
    expect(sign({ uri: '/workspace/document/1' })).toEqual({
      headers: expect.objectContaining(authorization),
      uri: `${PLATFORM_URL}/workspace/document/1`,
    });
  });

  it('does not sign a source of another domain', () => {
    const signed = sign({ uri: 'https://elsewhere.test/image.png' });
    expect(signed.uri).toBe('https://elsewhere.test/image.png');
    expect(signed.headers).not.toEqual(expect.objectContaining(authorization));
  });

  it('does not sign a domain that only starts like the one of the platform', () => {
    const signed = sign({ uri: 'https://platform.test.evil.com/image.png' });
    expect(signed.headers).not.toEqual(expect.objectContaining(authorization));
  });

  it('does not sign a source of the same domain with another scheme or port', () => {
    expect(sign({ uri: 'http://platform.test/image.png' }).headers).not.toEqual(expect.objectContaining(authorization));
    expect(sign({ uri: 'https://platform.test:8443/image.png' }).headers).not.toEqual(expect.objectContaining(authorization));
  });

  it('does not sign a local file', () => {
    expect(sign({ uri: 'file:///data/image.png' }).headers).not.toEqual(expect.objectContaining(authorization));
  });

  it('keeps the headers the source already has', () => {
    const signed = sign({ headers: { Accept: 'image/png' }, uri: '/image.png' });
    expect(signed.headers).toEqual(expect.objectContaining({ ...authorization, Accept: 'image/png' }));
  });

  it('signs each source of a list', () => {
    const signed = signSource<ImageURISource[]>(account, [{ uri: '/a.png' }, { uri: '/b.png' }]);
    expect(signed.map(source => source.uri)).toEqual([`${PLATFORM_URL}/a.png`, `${PLATFORM_URL}/b.png`]);
    signed.forEach(source => expect(source.headers).toEqual(expect.objectContaining(authorization)));
  });

  it('gives back what is not an url source', () => {
    expect(signSource(account, 12)).toBe(12);
    expect(signSource(account, undefined)).toBeUndefined();
    expect(signSource(account, null)).toBeNull();
  });

  it('gives back the source as it was if it can not be signed', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const source = { uri: '/image.png' };
    expect(signSource({ ...account, platform: 'unknown' } as never, source)).toBe(source);
  });
});

describe('resolveUrl', () => {
  it('gives the domain of the platform of the account to an url that has none', () => {
    expect(resolveUrl('/workspace/document/1', account)).toBe(`${PLATFORM_URL}/workspace/document/1`);
  });

  it('gives back any other url as it is', () => {
    expect(resolveUrl('https://elsewhere.test/a.png', account)).toBe('https://elsewhere.test/a.png');
    expect(resolveUrl('file:///a.png', account)).toBe('file:///a.png');
  });
});
