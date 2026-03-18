import { I18n } from '~/app/i18n';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { openUrl } from '~/framework/util/linking';

const getRedirectUrl = (session: AuthActiveAccount, connectorAddress: string, pageId?: string) => {
  const getSlash = (link: string) => {
    const service = decodeURIComponent(link);
    return service.charAt(service.length - 1) === '/' ? '' : '%2F';
  };
  let link = `${session.platform.url}/auth/redirect?url=${encodeURIComponent(connectorAddress)}`;

  link += `${getSlash(link)}mobile.html`;

  if (pageId) {
    link += encodeURIComponent(`?page=${pageId}`);
  }
  return link;
};

export default async (session: AuthActiveAccount, connectorAddress: string, pageId?: string, dryRun?: boolean) => {
  const finalUrl = getRedirectUrl(session, connectorAddress, pageId);
  if (dryRun) return finalUrl;
  openUrl(finalUrl, {
    error: I18n.get('pronote-redirect-error-message'),
    errorTitle: I18n.get('pronote-redirect-error-title'),
  });
};
