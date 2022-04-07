import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';



import { UI_SIZES } from '~/framework/components/constants';
import { IFolder } from '~/modules/zimbra/state/initMails';
import { CommonStyles } from '~/styles/common/styles';
import { DialogButtonCancel, DialogButtonOk } from '~/ui/ConfirmDialog';
import { ModalBox, ModalContent } from '~/ui/Modal';
import { Text } from '~/ui/Typography';
import { Icon } from '~/ui/icons/Icon';


type MoveToFolderModalProps = {
  show: boolean;
  folders: IFolder[];
  selectedFolder: string | null;
  closeModal: () => any;
  confirm: () => any;
  selectFolder: (id: string) => any;
};

export default class MoveToFolderModal extends React.Component<MoveToFolderModalProps> {
  private renderOption = (id, displayName, iconName) => {
    const { selectedFolder, selectFolder } = this.props;
    const selected = selectedFolder === id;
    const touchableStyle = selected ? [style.opacity, style.selectedItem] : style.opacity;
    const textStyle = selected ? { color: 'white', fontSize: 18 } : { fontSize: 18 };
    const iconStyle = selected ? { color: 'white', margin: 10 } : { margin: 10 };
    return (
      <>
        <TouchableOpacity
          onPress={() => {
            selectFolder(id);
          }}
          style={touchableStyle}>
          <View style={style.rowView}>
            <Icon name={iconName} size={20} style={iconStyle} />
            <Text numberOfLines={1} style={textStyle}>
              {displayName}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={style.separator} />
      </>
    );
  };

  public findMainFolderId = (name: string) => {
    const folderInfos = this.props?.folders?.find(item => item.folderName === name);
    if (folderInfos) return folderInfos.id;
    else return '';
  };

  public render() {
    const { show, folders, closeModal, confirm } = this.props;
    const inboxSubFolder = folders?.find(item => item.folderName === 'Inbox');
    return (
      <ModalBox isVisible={show}>
        <ModalContent style={{ width: UI_SIZES.screen.width - 80 }}>
          <View style={style.containerView}>
            <View style={{ alignSelf: 'baseline', paddingBottom: 8, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 18 }}>{I18n.t('zimbra-move-to')}</Text>
            </View>
            <ScrollView style={{ flexGrow: 1, height: UI_SIZES.screen.width }}>
              <View style={{ backgroundColor: '#eef7fb', width: '100%', padding: 4 }}>
                <Text style={{ fontSize: 18 }}>{I18n.t('zimbra-messages')}</Text>
              </View>
              {this.renderOption('inbox', I18n.t('zimbra-inbox'), 'inbox')}
              {this.renderOption(this.findMainFolderId('Sent'), I18n.t('zimbra-outbox'), 'send')}
              {this.renderOption(this.findMainFolderId('Drafts'), I18n.t('zimbra-drafts'), 'insert_drive_file')}
              {this.renderOption(this.findMainFolderId('Trash'), I18n.t('zimbra-trash'), 'delete')}
              {this.renderOption(this.findMainFolderId('Junk'), I18n.t('zimbra-spams'), 'delete_sweep')}
              {inboxSubFolder !== undefined && inboxSubFolder.folders !== undefined && inboxSubFolder.folders.length > 0 && (
                <View>
                  <View style={{ backgroundColor: 'lightblue', width: '100%', padding: 4 }}>
                    <Text style={{ fontSize: 18 }}>{I18n.t('zimbra-directories')}</Text>
                  </View>
                  <View>{inboxSubFolder.folders.map(f => this.renderOption(f.id, f.folderName, 'folder'))}</View>
                </View>
              )}
            </ScrollView>
            <View style={{ flexDirection: 'row-reverse', padding: 20, paddingBottom: 10 }}>
              <DialogButtonOk label={I18n.t('zimbra-move')} onPress={confirm} />
              <DialogButtonCancel onPress={() => closeModal()} />
            </View>
          </View>
        </ModalContent>
      </ModalBox>
    );
  }
}

const style = StyleSheet.create({
  containerView: {
    flexGrow: 1,
    width: '100%',
    marginTop: -25,
  },
  rowView: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 1,
    overflow: 'hidden',
    paddingRight: 90,
  },
  separator: {
    borderBottomColor: CommonStyles.borderColorVeryLighter,
    borderBottomWidth: 4,
    width: '100%',
  },
  opacity: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  selectedItem: {
    backgroundColor: '#fc8500',
  },
  itemTextSelected: {
    color: 'white',
  },
});