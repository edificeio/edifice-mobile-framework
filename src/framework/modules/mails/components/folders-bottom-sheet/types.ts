import { IMailsFolder } from '~/framework/modules/mails/model';

export interface MailsFoldersBottomSheetProps {
  title: string;
  disabledAction: boolean;
  action: () => void;
  folders: IMailsFolder[] | undefined;
  onPressCreateFolderButton: () => void;
  onPressFolder: (folder: IMailsFolder) => void;
  newParentFolderId: string | undefined;
  mailFolderId: string | null;
}
