import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Toast from 'react-native-tiny-toast';

import theme from '~/app/theme';
import ModalBox, { ModalBoxHandle } from '~/framework/components/ModalBox';
import ActionButton from '~/framework/components/buttons/action';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { BodyText } from '~/framework/components/text';
import { ISession } from '~/framework/modules/auth/model';
import { IFolder } from '~/framework/modules/zimbra/model';
import { zimbraService } from '~/framework/modules/zimbra/service';
import { getFolderName } from '~/framework/modules/zimbra/utils/folderName';

const styles = StyleSheet.create({
  androidAdditionalHeight: {
    height: 200, // workaround to impossible android scroll outside of the modal view
  },
  dropdown: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
    marginVertical: UI_SIZES.spacing.medium,
  },
  dropdownText: {
    color: theme.ui.text.regular,
  },
});

interface IMoveMailsModalProps {
  folderPath: string;
  folders: IFolder[];
  mailIds: string[];
  session?: ISession;
  successCallback: () => any;
}

const MoveMailsModal = React.forwardRef<ModalBoxHandle, IMoveMailsModalProps>((props, ref) => {
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null);
  const [isDropdownOpen, setDropdownOpen] = React.useState<boolean>(false);
  const [isMoving, setMoving] = React.useState<boolean>(false);

  const moveMails = async () => {
    try {
      const { mailIds, session } = props;

      setMoving(true);
      if (!session || !selectedFolderId) throw new Error();
      await zimbraService.mails.moveToFolder(session, mailIds, selectedFolderId);
      props.successCallback();
      setMoving(false);
      setSelectedFolderId(null);
      Toast.show(I18n.t(mailIds.length > 1 ? 'zimbra-messages-moved' : 'zimbra-message-moved'), { ...UI_ANIMATIONS.toast });
    } catch {
      setMoving(false);
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const getMainFolderItem = (path: string): { label: string; value: string; path: string } => {
    const folder = props.folders.find(f => f.path === path) ?? props.folders[0];
    return { label: getFolderName(folder.name), value: folder.id, path: folder.path };
  };

  const getFolderItems = (): { label: string; value: string }[] => {
    const { folderPath } = props;
    const folders =
      folderPath !== '/Inbox' && folderPath !== '/Drafts'
        ? [getMainFolderItem('/Inbox'), getMainFolderItem('/Trash'), getMainFolderItem('/Junk')]
        : [];
    folders.push(
      ...(props.folders
        .find(item => item.path === '/Inbox')
        ?.folders.map(folder => ({
          label: folder.name,
          value: folder.id,
          path: folder.path,
        })) ?? []),
    );
    return folders.filter(folder => folder.path !== folderPath);
  };

  return (
    <ModalBox
      ref={ref}
      content={
        <View>
          <BodyText>{I18n.t('zimbra-move-to')}</BodyText>
          <DropDownPicker
            open={isDropdownOpen}
            value={selectedFolderId}
            items={getFolderItems()}
            setOpen={setDropdownOpen}
            setValue={setSelectedFolderId}
            placeholder={I18n.t('conversation.selectDirectory')}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdown}
            containerStyle={Platform.OS === 'android' && isDropdownOpen ? styles.androidAdditionalHeight : undefined}
            textStyle={styles.dropdownText}
          />
          <ActionButton
            text={I18n.t(props.folderPath === '/Trash' ? 'zimbra-restore' : 'zimbra-move')}
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
