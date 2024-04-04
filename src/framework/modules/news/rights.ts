import { AuthLoggedAccount } from '~/framework/modules/auth/model';

export const createThreadsRight = 'net.atos.entng.actualites.controllers.ThreadController|createThread';

export const getNewsRights = (session: AuthLoggedAccount) => ({
  threads: {
    create: session.rights.authorizedActions.some(a => a.name === createThreadsRight),
  },
});
