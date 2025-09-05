import { IMailsFolder } from '~/framework/modules/mails/model';

export interface MailsMoveBottomSheetProps {
  onMove: (folderId: string) => void;
  folders: IMailsFolder[] | undefined;
  onPressCreateFolderButton?: () => void;
  mailFolderId: string | null;
}
