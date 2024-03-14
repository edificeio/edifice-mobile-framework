import { ModuleConfig } from '~/framework/util/moduleTool';

import type { IAuthState } from './reducer';

export default new ModuleConfig<'auth', IAuthState>({
  name: 'auth',
  entcoreScope: ['auth', 'userinfo'],
  matchEntcoreApp: () => true, // Auth always included
  storageName: 'auth',
});
