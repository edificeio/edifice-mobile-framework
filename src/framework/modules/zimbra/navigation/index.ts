import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/zimbra/module-config';
import type { ZimbraComposerScreenNavParams } from '~/framework/modules/zimbra/screens/composer';
import type { ZimbraMailScreenNavParams } from '~/framework/modules/zimbra/screens/mail';
import type { ZimbraMailListScreenNavParams } from '~/framework/modules/zimbra/screens/mail-list';

export const zimbraRouteNames = {
  composer: `${moduleConfig.routeName}/composer` as 'composer',
  home: moduleConfig.routeName as 'home',
  mail: `${moduleConfig.routeName}/mail` as 'mail',
  mailList: `${moduleConfig.routeName}/mail-list` as 'mailList',
};
export interface ZimbraNavigationParams extends ParamListBase {
  composer: ZimbraComposerScreenNavParams;
  mail: ZimbraMailScreenNavParams;
  mailList: ZimbraMailListScreenNavParams;
}
