import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { openUrl } from '~/framework/util/linking';
import { signedFetchJson } from '~/infra/fetchWithCache';

export default async (session: AuthLoggedAccount, connectorAddress: string) => {
  const url = `${session.platform.url}${connectorAddress}&noRedirect=true`;
  const { link } = (await signedFetchJson(url)) as { link?: string };
  openUrl(link);
};
