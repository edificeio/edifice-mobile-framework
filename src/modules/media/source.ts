import React from 'react';
import type { ImageURISource } from 'react-native';

import appConf from '~/framework/util/appConf';
import { accountURISource } from '~/framework/util/transport/source';
import type { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/modules/auth/model';
import { getActiveAccount, selectActiveAccount, useAccountsStore } from '~/modules/auth/store/accounts';

/**
 * Sources signing: the headers that make a request authenticated, like `accountFetch` / `sessionFetch` do for `fetch`.
 * The media components of this module sign their `source` by themselves, so nobody has to think about it: use `signSource` only where
 * there is no component (download, share...) and `useSignedSource` for a third-party component that has no bridge here.
 *
 * - An url without domain (`/workspace/document/123`) is the one of the platform of the account.
 * - Only the urls of the platform of the account are signed (same origin), a token never goes anywhere else.
 */

/** The account that signs. */
export type SourceSigner = AuthActiveAccount | AuthSavedLoggedInAccount;

/** Props of every media component that takes a `source`. */
export interface SignedSourceProps {
  /** Signs with this account instead of the connected one (the list of accounts shows the avatars of the saved ones). */
  account?: SourceSigner;
  /** `false` to give the source as is. Default is `true`. */
  signed?: boolean;
}

/** What a `source` can be, whichever component takes it (`Image`, `FastImage`, `Video`, `Pdf`): a local resource, one or several uri. */
export type SignableSource = number | object | null | undefined;

/**
 * Signs the source for the account. A source that can't be signed (no platform known, local resource...) is given back as it was.
 */
export const signSource = <Source extends SignableSource>(account: SourceSigner, source: Source): Source => {
  if (!source || typeof source === 'number') return source;
  try {
    if (Array.isArray(source)) return source.map(item => accountURISource(account, item as ImageURISource)) as Source;
    return accountURISource(account, source as ImageURISource) as Source;
  } catch (e) {
    console.warn('[Media] Unable to sign the source:', e);
    return source;
  }
};

/**
 * The signed source, for the connected account (even if it still has a requirement to fulfil) or the one of the `account` option.
 * Nothing is signed when there is no account, or when `signed` is `false`.
 * The result changes only when the account or the given `source` does: memoize `source` if it is built in the component.
 */
export const useSignedSource = <Source extends SignableSource>(
  source: Source,
  { account, signed = true }: SignedSourceProps = {},
): Source => {
  const connectedAccount = useAccountsStore(selectActiveAccount);
  const signer = signed ? (account ?? connectedAccount) : undefined;
  return React.useMemo(() => (signer ? signSource(signer, source) : source), [signer, source]);
};

/**
 * The absolute url of an url that has no domain (`/workspace/document/123`): the one of the platform of the account (the connected one
 * by default). Anything else is given back as it is.
 */
export const resolveUrl = (url: string, account: SourceSigner | undefined = getActiveAccount()) => {
  if (!account || !url.startsWith('/')) return url;
  try {
    const platform = appConf.getExpandedPlatform(account.platform);
    return platform ? new URL(url, platform.url).href : url;
  } catch {
    return url;
  }
};
