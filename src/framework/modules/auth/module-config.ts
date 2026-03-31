import type { AuthState } from './reducer';

import { ModuleConfig } from '~/framework/util/moduleTool';

export default new ModuleConfig<'auth', AuthState>({
  entcoreScope: [
    'auth',
    'userbook',
    'directory',
    /* ToDo: put the followg scopes anywhere else that not belongs to auth module */
    'infra', // seems to be tracking related
    'portal', // dont knwo if used somewhere
    'userinfo', // wtf is this thing ?
  ],
  // Auth always included
  hasRight: () => true,
  matchEntcoreApp: () => false,
  name: 'auth',
  storageName: 'auth',
  trackingName: 'Authentification',
});
