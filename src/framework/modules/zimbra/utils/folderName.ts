import I18n from 'i18n-js';

import { SystemFolder } from '~/framework/modules/zimbra/model';

export const getFolderName = (folder: SystemFolder | string): string => {
  switch (folder) {
    case SystemFolder.DRAFTS:
      return I18n.t('zimbra-drafts');
    case SystemFolder.INBOX:
      return I18n.t('zimbra-inbox');
    case SystemFolder.JUNK:
      return I18n.t('zimbra-spams');
    case SystemFolder.SENT:
      return I18n.t('zimbra-outbox');
    case SystemFolder.TRASH:
      return I18n.t('zimbra-trash');
    default:
      return folder;
  }
};
