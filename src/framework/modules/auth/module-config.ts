import type { IAuthState } from './reducer';

import { ModuleConfig } from '~/framework/util/moduleTool';

export default new ModuleConfig<'auth', IAuthState>({
  entcoreScope: [
    'auth',
    'userbook',
    'directory',
    /* ToDo: put the followg sccopes anywhere else that not belongs to auth module*/
    'infra', // seems to be tracking related
    'portal', // dont knwo if used somewhere
    'userinfo', // wtf is this thing ?
  ],
  matchEntcoreApp: () => true,
  name: 'auth', // Auth always included
  storageName: 'auth',
  trackingName: 'Authentification',
});
