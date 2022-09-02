import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { openUrl } from '~/framework/util/linking';
import { IUserSession } from '~/framework/util/session';
import { signedFetch } from '~/infra/fetchWithCache';

const profileMap = {
  TEACHER: 'professeur',
  STUDENT: 'eleve',
  RELATIVE: 'parent',
  PERSONNEL: 'direction',
};

const getRedirectUrl = (session: IUserSession, connectorAddress: string, pageId?: string) => {
  const getSlash = (link: string) => {
    const service = decodeURIComponent(link);
    return service.charAt(service.length - 1) === '/' ? '' : '%2F';
  };
  let link = `${DEPRECATED_getCurrentPlatform()!.url}/cas/oauth/login?service=${encodeURIComponent(connectorAddress)}`;
  const role = profileMap[session.user.type.toUpperCase()];
  link += `${getSlash(link)}mobile.${role}.html`;
  if (pageId) {
    link += encodeURIComponent(`?page=${pageId}`);
  }
  return link;
};

export default async (session: IUserSession, connectorAddress: string, pageId?: string) => {
  const intermediateResponse = await signedFetch(getRedirectUrl(session, connectorAddress, pageId));
  const finalUrl = intermediateResponse.headers.get('location');
  openUrl(finalUrl ?? undefined);
};
