import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/mails/module-config';
import { MailsListScreenNavParams } from '~/framework/modules/mails/screens/list/types';

export const mailsRouteNames = {
  home: `${moduleConfig.name}` as 'home',
};
export interface MailsNavigationParams extends ParamListBase {
  home: MailsListScreenNavParams;
}
