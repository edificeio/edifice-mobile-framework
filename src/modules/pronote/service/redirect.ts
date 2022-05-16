import I18n from 'i18n-js';
import { Alert, Linking } from 'react-native';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { IUserSession } from '~/framework/util/session';
import { signedFetch } from '~/infra/fetchWithCache';

const profileMap = {
  TEACHER: 'professeur',
  STUDENT: 'eleve',
  RELATIVE: 'parent',
  PERSONNEL: 'direction',
};

const getRedirectUrl = (session: IUserSession, connectorAddress: string, pageId?: string) => {
  console.log('getRedirectUrl', connectorAddress, pageId);
  const getSlash = (link: string) => {
    const service = decodeURIComponent(link);
    return service.charAt(service.length - 1) === '/' ? '' : '%2F';
  };
  let link = `${DEPRECATED_getCurrentPlatform()!.url}/cas/oauth/login?service=${encodeURIComponent(connectorAddress)}`;
  const role = profileMap[session.user.type.toUpperCase()];
  link += `${getSlash(link)}${role}.html`;
  if (pageId) {
    link += encodeURIComponent(`?page=${pageId}`);
  }
  return link;
};

export default async (session: IUserSession, connectorAddress: string, pageId?: string) => {
  Alert.alert(
    I18n.t('common.redirect.browser.title'),
    I18n.t('common.redirect.browser.message'),
    [
      {
        text: I18n.t('common.cancel'),
        style: 'cancel',
      },
      {
        text: I18n.t('common.continue'),
        onPress: async () => {
          console.log('redirectUrl', getRedirectUrl(session, connectorAddress, pageId));
          const intermediateResponse = await signedFetch(getRedirectUrl(session, connectorAddress, pageId));
          const finalUrl = intermediateResponse.headers.get('location');
          if (!finalUrl) {
            Alert.alert(I18n.t('common.redirect.browser.error'));
            return;
          }
          const isSupported = await Linking.canOpenURL(finalUrl);
          if (isSupported === true) {
            await Linking.openURL(finalUrl);
          } else {
            Alert.alert(I18n.t('common.redirect.browser.error'));
          }
        },
        style: 'default',
      },
    ],
    {
      cancelable: true,
    },
  );
};
