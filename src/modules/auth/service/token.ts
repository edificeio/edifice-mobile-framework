import { Platform } from '~/framework/util/appConf';
import { expirableTokenFactory, getOAuth2AccessToken } from '~/framework/util/oauth2';
import { tokenFetch } from '~/framework/util/transport';
import { FetchError, FetchErrorCode } from '~/framework/util/transport/error';
import {
  AuthActiveAccount,
  AuthCredentials,
  AuthFederationCredentials,
  type AuthLoggedAccount,
  credentialsAreCustomToken,
  credentialsAreLoginPassword,
  credentialsAreSaml,
} from '~/modules/auth/model';

export async function getToken(platform: Platform, credentials: AuthCredentials | AuthFederationCredentials) {
  if (credentialsAreLoginPassword(credentials)) {
    return getOAuth2AccessToken.withLoginPassword(platform, credentials);
  } else if (credentialsAreSaml(credentials)) {
    return getOAuth2AccessToken.withSaml2(platform, credentials.saml);
  } else if (credentialsAreCustomToken(credentials)) {
    return getOAuth2AccessToken.withCustomToken(platform, credentials.customToken);
  } else {
    throw new global.Error(`[auth.createSession] given credentials are not recognisable.`);
  }
}

export async function getOneSessionId({
  tokens,
}: Pick<AuthLoggedAccount, 'tokens'>): Promise<NonNullable<AuthActiveAccount['tokens']['oneSessionId']>> {
  const response = await tokenFetch(tokens, '/auth/oauth2/token-as-cookie', { method: 'POST' });
  const cookie = response.headers.get('set-cookie');
  if (!cookie) throw new FetchError(FetchErrorCode.BAD_RESPONSE, 'getOneSessionId: no set-cookie header recieved');
  const match = cookie.match(/oneSessionId=([^;]+)/);
  if (!match || !match[1])
    throw new FetchError(FetchErrorCode.BAD_RESPONSE, 'getOneSessionId: set-cookie header does not include oneSessionId');
  return { value: match[1] };
}

export async function getQueryParamToken({
  tokens,
}: Pick<AuthLoggedAccount, 'tokens'>): Promise<NonNullable<AuthActiveAccount['tokens']['queryParam']>> {
  const response = await tokenFetch.json<{ token_type: 'QueryParam'; access_token: string; expires_in: number }>(
    tokens,
    '/auth/oauth2/token?type=queryparam',
  );
  return expirableTokenFactory(response);
}
