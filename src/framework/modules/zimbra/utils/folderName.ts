import { I18n } from '~/app/i18n';
import { SystemFolder } from '~/framework/modules/zimbra/model';

export const getFolderName = (folder: SystemFolder | string): string => {
  switch (folder) {
    case SystemFolder.DRAFTS:
      return I18n.get('zimbra-maillistscreen-folder-drafts');
    case SystemFolder.INBOX:
      return I18n.get('zimbra-maillistscreen-folder-inbox');
    case SystemFolder.JUNK:
      return I18n.get('zimbra-maillistscreen-folder-spams');
    case SystemFolder.SENT:
      return I18n.get('zimbra-maillistscreen-folder-outbox');
    case SystemFolder.TRASH:
      return I18n.get('zimbra-maillistscreen-folder-trash');
    default:
      return folder;
  }
};
