import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { openUrl } from '~/framework/util/linking';
import { sessionFetch } from '~/framework/util/transport';

export default async (session: AuthActiveAccount, connectorAddress: string) => {
  const url = `${connectorAddress}&noRedirect=true`;
  const { link } = await sessionFetch.json<{ link?: string }>(url);
  openUrl(link);
};
