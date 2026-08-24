import type { AuthActiveAccount } from '~/framework/modules/auth/model';

export const createThreadsRight = 'net.atos.entng.actualites.controllers.ThreadController|createThread';
export const viewNewsRight = 'net.atos.entng.actualites.controllers.DisplayController|view';

export const getNewsRights = (session: AuthActiveAccount) => ({
  threads: {
    create: session.rights.authorizedActions.some(a => a.name === createThreadsRight),
  },
  view: session.rights.authorizedActions.some(a => a.name === viewNewsRight),
});
