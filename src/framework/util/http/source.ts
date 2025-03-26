import { ImageProps, ImageURISource } from 'react-native';

import { RequestBuilder } from './request-builder';

import { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';

export const sourceForAccount = (
  account: AuthSavedLoggedInAccount | AuthActiveAccount,
  source: ImageURISource,
  customizeRequest?: (r: RequestBuilder) => RequestBuilder,
): ImageURISource => {
  const { method: _method, uri: _uri, ...init } = source;
  if (!_uri) return source;
  let builder = new RequestBuilder(_method, _uri, init).withAccount(account);
  if (customizeRequest) {
    builder = customizeRequest(builder);
  }
  const { headers, method, url } = builder.build();
  return {
    ...source,
    headers: Object.fromEntries(headers.entries()),
    method,
    uri: url,
  };
};

const imageSourcePropForAccount = (
  account: AuthSavedLoggedInAccount | AuthActiveAccount,
  source: ImageProps['source'],
  thumbnail?: string,
): ImageProps['source'] => {
  const customizeRequest: ((r: RequestBuilder) => RequestBuilder) | undefined = thumbnail
    ? b => b.withSearchParams({ thumbnail })
    : undefined;
  if (source === undefined) return source;
  if (typeof source === 'number') return source;
  if (Array.isArray(source)) return source.map(s => sourceForAccount(account, s, customizeRequest));
  else return sourceForAccount(account, source, customizeRequest);
};

export const imagePropsForAccount = (
  account: AuthSavedLoggedInAccount | AuthActiveAccount,
  { source, src, srcSet, ...props }: ImageProps,
  thumbnail?: string,
) => ({
  ...props,
  source: imageSourcePropForAccount(account, source, thumbnail),
  src, // ToDo : parse src + descriptor and sign it + place in source prop
  srcSet, // ToDo : parse srcSet + descriptors and sign them + place in source prop
});

export const imagePropsForSession = (props: ImageProps, thumbnail?: string) => {
  const account = getSession();
  // if not logged not sure if image has a domain name, so we're note sure that URL will be parsable to add thumbnail param.
  if (!account) {
    return props;
  }
  return imagePropsForAccount(account, props, thumbnail);
};
