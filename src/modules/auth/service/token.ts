import { Platform } from '~/framework/util/appConf';
import { getOAuth2AccessToken } from '~/framework/util/oauth2';

import {
  AuthCredentials,
  AuthFederationCredentials,
  credentialsAreCustomToken,
  credentialsAreLoginPassword,
  credentialsAreSaml,
} from '../model';

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
