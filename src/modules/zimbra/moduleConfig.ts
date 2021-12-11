import { IZimbra_State } from './reducer';

import { createNavigableModuleConfig } from '~/framework/util/moduleTool';

export default createNavigableModuleConfig<'zimbra', IZimbra_State>({
  name: 'zimbra',
  displayName: 'Conversation',
  matchEntcoreApp: '/zimbra/zimbra',
  entcoreScope: ['zimbra'],
  iconName: 'mail',
  apiName: 'Zimbra',
  registerAs: 'tabModule',
});
