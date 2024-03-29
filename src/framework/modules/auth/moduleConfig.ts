import { ModuleConfig } from '~/framework/util/moduleTool';

import { IAuthState } from './reducer';

export default new ModuleConfig<'auth', IAuthState>({
  name: 'auth',
  entcoreScope: ['auth', 'userinfo'],
  matchEntcoreApp: () => true, // Auth always included
});
