import type { AuthState } from './redux/types';

import { ModuleConfig } from '~/framework/util/moduleTool';

/**
 * @deprecated use new module system
 */
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
  matchEntcoreApp: null,
  name: 'auth',
  storageName: 'auth',
  trackingName: 'Authentification',
});
