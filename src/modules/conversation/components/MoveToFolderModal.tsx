import I18n from 'i18n-js';
import * as React from 'react';
import { View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextBold, TextSemiBold } from '~/framework/components/text';
import { IFolder } from '~/modules/conversation/state/initMails';
import { DialogButtonCancel, DialogButtonOk } from '~/ui/ConfirmDialog';
import { ModalBox, ModalContent } from '~/ui/Modal';

type MoveToFolderModalProps = {
  show: boolean;
  folders: IFolder[];
  currentFolder: string;
  selectedFolder: string | null;
  closeModal: () => any;
  confirm: () => any;
  selectFolder: (id: string) => any;
};

type MoveToFolderModalState = {
  openDropdown: boolean;
};

export default class MoveToFolderModal extends React.Component<MoveToFolderModalProps, MoveToFolderModalState> {
  constructor(props) {
    super(props);
    this.state = {
      openDropdown: false,
    };
  }

  public render() {
    const { show, folders, closeModal, confirm, currentFolder, selectFolder, selectedFolder } = this.props;
    const { openDropdown } = this.state;
    const isCurrentFolderInbox = currentFolder === 'inbox';
    const isCurrentFolderTrash = currentFolder === 'trash';
    const modalTitle = `conversation.${isCurrentFolderTrash ? 'restore' : 'move'}To`;
    const foldersWithoutCurrent = folders && folders.filter(folder => folder.folderName !== currentFolder);
    const options: any = [];
    !isCurrentFolderInbox && options.push({ label: I18n.t('conversation.inbox'), value: 'inbox' });

    if (foldersWithoutCurrent && foldersWithoutCurrent.length > 0) {
      for (const folder of foldersWithoutCurrent) {
        options.push({ label: folder.folderName, value: folder.id });
      }
    }
    const isMoveImpossible = options.length === 0;

    return (
      <ModalBox
        isVisible={show}
        propagateSwipe
        style={{ alignItems: 'stretch' }}
        onBackdropPress={() => {
          selectFolder('');
          closeModal();
        }}>
        <ModalContent
          style={{
            height: 250,
            padding: UI_SIZES.spacing.big,
            paddingTop: undefined,
            width: undefined,
            justifyContent: 'space-between',
          }}>
          <TextBold>{I18n.t(modalTitle)}</TextBold>
          {isMoveImpossible ? (
            <TextSemiBold>{I18n.t('conversation.moveImpossible')}</TextSemiBold>
          ) : (
            <DropDownPicker
              open={openDropdown}
              items={options}
              value={selectedFolder}
              setOpen={() => this.setState({ openDropdown: !openDropdown })}
              setValue={callback => selectFolder(callback(selectedFolder))}
              placeholder={I18n.t('conversation.moveSelect')}
              placeholderStyle={{ color: theme.ui.text.light }}
              textStyle={{ color: theme.palette.primary.regular, fontWeight: 'bold' }}
              style={{ borderColor: theme.palette.primary.regular, borderWidth: 1 }}
              dropDownContainerStyle={{
                borderColor: theme.palette.primary.regular,
                borderWidth: 1,
                maxHeight: 120,
              }}
            />
          )}
          <View style={{ flexDirection: 'row' }}>
            <DialogButtonCancel
              onPress={() => {
                selectFolder('');
                closeModal();
              }}
              style={{
                backgroundColor: theme.ui.background.card,
                borderColor: theme.palette.primary.regular,
                borderWidth: 1,
                borderRadius: 20,
                width: 150,
              }}
              textStyle={{ color: theme.palette.primary.regular, fontWeight: 'bold' }}
            />
            <DialogButtonOk
              onPress={() => {
                selectFolder('');
                confirm();
              }}
              style={{
                backgroundColor: isMoveImpossible || !selectedFolder ? theme.ui.text.light : theme.palette.primary.regular,
                borderRadius: 20,
                width: 150,
              }}
              textStyle={{ fontWeight: 'bold' }}
              disabled={isMoveImpossible || !selectedFolder}
              label={I18n.t(`conversation.${isCurrentFolderTrash ? 'restore' : 'move'}`)}
            />
          </View>
        </ModalContent>
      </ModalBox>
    );
  }
}
