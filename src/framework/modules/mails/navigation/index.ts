import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/mails/module-config';
import { MailsEditScreenNavParams } from '~/framework/modules/mails/screens/edit/types';
import { MailsListScreenNavParams } from '~/framework/modules/mails/screens/list/types';

export const mailsRouteNames = {
  edit: `${moduleConfig.name}/edit` as 'edit',
  home: `${moduleConfig.name}` as 'home',
};
export interface MailsNavigationParams extends ParamListBase {
  home: MailsListScreenNavParams;
  edit: MailsEditScreenNavParams;
}
