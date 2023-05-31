import I18n from 'i18n-js';

import { DefaultFolder } from '~/framework/modules/zimbra/model';

export const getFolderName = (folder: DefaultFolder | string): string => {
  switch (folder) {
    case DefaultFolder.DRAFTS:
      return I18n.t('zimbra-drafts');
    case DefaultFolder.INBOX:
      return I18n.t('zimbra-inbox');
    case DefaultFolder.JUNK:
      return I18n.t('zimbra-spams');
    case DefaultFolder.SENT:
      return I18n.t('zimbra-outbox');
    case DefaultFolder.TRASH:
      return I18n.t('zimbra-trash');
    default:
      return folder;
  }
};
