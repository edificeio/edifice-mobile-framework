import * as React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { I18n } from '~/app/i18n';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import ModalBox, { ModalBoxHandle } from '~/framework/components/ModalBox';
import { BodyText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { FolderButton } from '~/framework/modules/zimbra/components/FolderButton';
import { IFolder } from '~/framework/modules/zimbra/model';
import { zimbraService } from '~/framework/modules/zimbra/service';
import { getFolderName } from '~/framework/modules/zimbra/utils/folderName';

const styles = StyleSheet.create({
  listContainer: {
    marginVertical: UI_SIZES.spacing.medium,
    maxHeight: 400,
  },
});

interface IMoveMailsModalProps {
  folderPath: string;
  folders: IFolder[];
  mailFolders: string[];
  mailIds: string[];
  session?: AuthLoggedAccount;
  successCallback: () => any;
}

const MoveMailsModal = React.forwardRef<ModalBoxHandle, IMoveMailsModalProps>((props, ref) => {
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null);
  const [isMoving, setMoving] = React.useState<boolean>(false);

  const selectFolder = (folder: IFolder) => setSelectedFolderId(folder.id);

  const moveMails = async () => {
    try {
      const { mailIds, session } = props;

      setMoving(true);
      if (!session || !selectedFolderId) throw new Error();
      await zimbraService.mails.moveToFolder(session, mailIds, selectedFolderId);
      props.successCallback();
      setMoving(false);
      setSelectedFolderId(null);
      Toast.showSuccess(I18n.get(mailIds.length > 1 ? 'zimbra-movemailsmodal-mails-moved' : 'zimbra-movemailsmodal-mail-moved'));
    } catch {
      setMoving(false);
      Toast.showError(I18n.get('zimbra-movemailsmodal-error-text'));
    }
  };

  const getFolders = (): IFolder[] => {
    const { folderPath, mailFolders } = props;
    const systemFolders = folderPath !== '/Inbox' && folderPath !== '/Drafts' ? ['/Inbox', '/Trash', '/Junk'] : [];

    if (mailFolders.includes('OUTBOX')) systemFolders.push('/Sent');
    if (mailFolders.includes('DRAFT')) systemFolders.push('/Drafts');
    return props.folders
      .filter(f => systemFolders.includes(f.path))
      .map(f => ({ ...f, folders: [], name: getFolderName(f.name) }) as IFolder)
      .concat(props.folders.find(f => f.path === '/Inbox')?.folders ?? []);
  };

  return (
    <ModalBox
      ref={ref}
      content={
        <View>
          <BodyText>{I18n.get('zimbra-movemailsmodal-title')}</BodyText>
          <FlatList
            data={getFolders()}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <FolderButton
                folder={item}
                currentFolderPath={props.folderPath}
                selectedFolderId={selectedFolderId}
                onPress={selectFolder}
              />
            )}
            style={styles.listContainer}
          />
          <PrimaryButton
            text={I18n.get(props.folderPath === '/Trash' ? 'zimbra-movemailsmodal-restore' : 'zimbra-movemailsmodal-move')}
            action={moveMails}
            disabled={!selectedFolderId}
            loading={isMoving}
          />
        </View>
      }
    />
  );
});

export default MoveMailsModal;
