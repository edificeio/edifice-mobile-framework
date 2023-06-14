import { ISession } from '~/framework/modules/auth/model';

export const createThreadsRight = 'net.atos.entng.actualites.controllers.ThreadController|createThread';

export const getNewsRights = (session: ISession) => ({
  threads: {
    create: session.authorizedActions.some(a => a.name === createThreadsRight),
  },
});
