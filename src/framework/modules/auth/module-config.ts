import type { IAuthState } from './reducer';

import { ModuleConfig } from '~/framework/util/moduleTool';

export default new ModuleConfig<'auth', IAuthState>({
  entcoreScope: ['auth', 'userinfo'],
  matchEntcoreApp: () => true,
  name: 'auth', // Auth always included
  storageName: 'auth',
  trackingName: 'Authentification',
});
