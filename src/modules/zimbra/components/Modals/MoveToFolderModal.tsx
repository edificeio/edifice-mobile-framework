import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { Text } from '~/framework/components/text';
import { IFolder } from '~/modules/zimbra/state/initMails';
import { CommonStyles } from '~/styles/common/styles';
import { DialogButtonCancel, DialogButtonOk } from '~/ui/ConfirmDialog';
import { ModalBox, ModalContent } from '~/ui/Modal';

const styles = StyleSheet.create({
  containerView: {
    flexGrow: 1,
    width: '100%',
    marginTop: -25,
  },
  moveTextContainer: {
    alignSelf: 'baseline',
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  textStyle: {
    fontSize: 18,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  actionsContainers: {
    width: '100%',
    padding: 4,
  },
  messagesContainer: {
    backgroundColor: '#eef7fb',
  },
  directoriesContainer: {
    backgroundColor: 'lightblue',
  },
  actionsButtonsContainer: {
    flexDirection: 'row-reverse',
    padding: 20,
    paddingBottom: 10,
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
    const touchableStyle = selected ? [styles.opacity, styles.selectedItem] : styles.opacity;
    const textStyle = selected ? { color: 'white', fontSize: 18 } : { fontSize: 18 };
    const iconStyle = selected ? { color: 'white', margin: 10 } : { margin: 10 };
    return (
      <>
        <TouchableOpacity
          onPress={() => {
            selectFolder(id);
          }}
          style={touchableStyle}>
          <View style={styles.rowView}>
            <Icon name={iconName} size={20} style={iconStyle} />
            <Text numberOfLines={1} style={textStyle}>
              {displayName}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.separator} />
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
          <View style={styles.containerView}>
            <View style={styles.moveTextContainer}>
              <Text style={styles.textStyle}>{I18n.t('zimbra-move-to')}</Text>
            </View>
            <ScrollView style={[styles.scrollViewContainer, { height: UI_SIZES.screen.width }]}>
              <View style={[styles.actionsContainers, styles.messagesContainer]}>
                <Text style={styles.textStyle}>{I18n.t('zimbra-messages')}</Text>
              </View>
              {this.renderOption('inbox', I18n.t('zimbra-inbox'), 'inbox')}
              {this.renderOption(this.findMainFolderId('Sent'), I18n.t('zimbra-outbox'), 'send')}
              {this.renderOption(this.findMainFolderId('Drafts'), I18n.t('zimbra-drafts'), 'insert_drive_file')}
              {this.renderOption(this.findMainFolderId('Trash'), I18n.t('zimbra-trash'), 'delete')}
              {this.renderOption(this.findMainFolderId('Junk'), I18n.t('zimbra-spams'), 'delete_sweep')}
              {inboxSubFolder !== undefined && inboxSubFolder.folders !== undefined && inboxSubFolder.folders.length > 0 && (
                <View>
                  <View style={[styles.actionsContainers, styles.directoriesContainer]}>
                    <Text style={styles.textStyle}>{I18n.t('zimbra-directories')}</Text>
                  </View>
                  <View>{inboxSubFolder.folders.map(f => this.renderOption(f.id, f.folderName, 'folder'))}</View>
                </View>
              )}
            </ScrollView>
            <View style={styles.actionsButtonsContainer}>
              <DialogButtonOk label={I18n.t('zimbra-move')} onPress={confirm} />
              <DialogButtonCancel onPress={() => closeModal()} />
            </View>
          </View>
        </ModalContent>
      </ModalBox>
    );
  }
}
