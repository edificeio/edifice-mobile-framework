import { I18n } from '~/app/i18n';
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { openUrl } from '~/framework/util/linking';
import { signedFetch } from '~/infra/fetchWithCache';

const profileMap = {
  PERSONNEL: 'direction',
  RELATIVE: 'parent',
  STUDENT: 'eleve',
  TEACHER: 'professeur',
};

const getRedirectUrl = (session: AuthLoggedAccount, connectorAddress: string, pageId?: string) => {
  const getSlash = (link: string) => {
    const service = decodeURIComponent(link);
    return service.charAt(service.length - 1) === '/' ? '' : '%2F';
  };
  let link = `${session.platform.url}/cas/oauth/login?service=${encodeURIComponent(connectorAddress)}`;
  const role = profileMap[session.user.type.toUpperCase()];
  link += `${getSlash(link)}mobile.${role}.html`;
  if (pageId) {
    link += encodeURIComponent(`?page=${pageId}`);
  }
  return link;
};

export default async (session: AuthLoggedAccount, connectorAddress: string, pageId?: string, dryRun?: boolean) => {
  const intermediateResponse = await signedFetch(getRedirectUrl(session, connectorAddress, pageId));
  const finalUrl = intermediateResponse.headers.get('location');
  if (dryRun) return finalUrl ?? undefined;
  openUrl(finalUrl ?? undefined, {
    error: I18n.get('pronote-redirect-error-message'),
    errorTitle: I18n.get('pronote-redirect-error-title'),
  });
};
