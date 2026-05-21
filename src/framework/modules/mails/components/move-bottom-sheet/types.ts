import { FlatListProps } from 'react-native';

import { IMailsFolder } from '~/framework/modules/mails/model';

export interface MailsMoveBottomSheetProps extends Pick<FlatListProps<any>, 'style' | 'contentContainerStyle'> {
  onMove: (folderId: string) => void;
  folders: IMailsFolder[] | undefined;
  onPressCreateFolderButton?: () => void;
  mailFolderId: string | null;
}
