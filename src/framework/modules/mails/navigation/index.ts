import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/mails/module-config';
import { MailsDetailsOriginalContentScreenNavParams } from '~/framework/modules/mails/screens/details/original-content/types';
import { MailsDetailsScreenNavParams } from '~/framework/modules/mails/screens/details/types';
import { MailsEditScreenNavParams } from '~/framework/modules/mails/screens/edit/types';
import { MailsListScreenNavParams } from '~/framework/modules/mails/screens/list/types';
import { MailsSignatureScreenNavParams } from '~/framework/modules/mails/screens/signature/types';

export const mailsRouteNames = {
  details: `${moduleConfig.name}/details` as 'details',
  edit: `${moduleConfig.name}/edit` as 'edit',
  home: `${moduleConfig.name}` as 'home',
  originalContent: `${moduleConfig.name}/details/original-content` as 'originalContent',
  signature: `${moduleConfig.name}/signature` as 'signature',
};
export interface MailsNavigationParams extends ParamListBase {
  home: MailsListScreenNavParams;
  edit: MailsEditScreenNavParams;
  details: MailsDetailsScreenNavParams;
  originalContent: MailsDetailsOriginalContentScreenNavParams;
  signature: MailsSignatureScreenNavParams;
}
