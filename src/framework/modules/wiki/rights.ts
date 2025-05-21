import { AuthActiveAccount } from '~/framework/modules/auth/model';

export const hasWikiCreationRights = (session: AuthActiveAccount): boolean => {
  return session.rights.authorizedActions.some(a => a.name === 'net.atos.entng.wiki.controllers.WikiController|createWiki');
};
