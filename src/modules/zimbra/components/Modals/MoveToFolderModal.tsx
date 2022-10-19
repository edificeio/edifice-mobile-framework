import I18n from 'i18n-js';
import * as React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { BodyText } from '~/framework/components/text';
import { moveMailsToFolderAction, moveMailsToInboxAction } from '~/modules/zimbra/actions/mail';
import { IFolder } from '~/modules/zimbra/state/initMails';
import { getRootFolderListState } from '~/modules/zimbra/state/rootFolders';
import { DialogButtonCancel, DialogButtonOk } from '~/ui/ConfirmDialog';
import { ModalBox, ModalContent } from '~/ui/Modal';

const styles = StyleSheet.create({
  containerView: {
    flexGrow: 1,
    width: '100%',
    marginTop: -UI_SIZES.spacing.big,
  },
  moveTextContainer: {
    alignSelf: 'baseline',
    paddingBottom: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  actionsContainers: {
    width: '100%',
    padding: UI_SIZES.spacing.tiny,
  },
  messagesContainer: {
    backgroundColor: theme.palette.primary.light,
  },
  directoriesContainer: {
    backgroundColor: theme.palette.primary.light,
  },
  actionsButtonsContainer: {
    flexDirection: 'row-reverse',
    padding: UI_SIZES.spacing.big,
    paddingBottom: UI_SIZES.spacing.small,
  },
  rowView: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 1,
    overflow: 'hidden',
    paddingRight: UI_SIZES.spacing.huge,
  },
  separator: {
    borderBottomColor: theme.palette.grey.pearl,
    borderBottomWidth: 4,
    width: '100%',
  },
  opacity: {
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.tiny,
  },
  selectedItem: {
    backgroundColor: theme.palette.secondary.regular,
  },
});

type MoveToFolderModalProps = {
  folders: IFolder[];
  mail: any;
  show: boolean;
  closeModal: () => any;
  moveToFolder: (ids: string[], folder: string) => any;
  moveToInbox: (ids: string[]) => any;
  successCallback: () => any;
};

type MoveToFolderModalState = {
  selectedFolder: string | null;
};

class MoveToFolderModal extends React.Component<MoveToFolderModalProps, MoveToFolderModalState> {
  constructor(props) {
    super(props);
    this.state = {
      selectedFolder: null,
    };
  }

  selectFolder = (selectedFolder: string) => {
    this.setState({
      selectedFolder,
    });
  };

  confirm = async () => {
    const { moveToFolder, moveToInbox, mail, successCallback } = this.props;
    const { selectedFolder } = this.state;
    await this.props.closeModal();

    const mailsIds = [] as any;
    if (Array.isArray(mail)) mail.forEach(mailInfos => mailsIds.push(mailInfos.id));
    else mailsIds.push(mail.id);

    if (!selectedFolder) return;
    else if (selectedFolder === 'inbox') await moveToInbox(mailsIds);
    else await moveToFolder(mailsIds, selectedFolder);
    successCallback();
  };

  private renderOption = (id, displayName, iconName) => {
    const selected = this.state.selectedFolder === id;
    const touchableStyle = selected ? [styles.opacity, styles.selectedItem] : styles.opacity;
    const textStyle = selected ? { color: theme.ui.text.inverse } : {};
    const iconStyle = selected
      ? { color: theme.ui.text.inverse, margin: UI_SIZES.spacing.small }
      : { margin: UI_SIZES.spacing.small };
    return (
      <TouchableOpacity
        onPress={() => {
          this.selectFolder(id);
        }}
        style={[touchableStyle, styles.separator]}
        key={id}>
        <View style={styles.rowView}>
          <Icon name={iconName} size={20} style={iconStyle} />
          <BodyText numberOfLines={1} style={textStyle}>
            {displayName}
          </BodyText>
        </View>
      </TouchableOpacity>
    );
  };

  public findMainFolderId = (name: string) => {
    const folderInfos = this.props?.folders?.find(item => item.folderName === name);
    if (folderInfos) return folderInfos.id;
    else return '';
  };

  public render() {
    const { show, folders, closeModal } = this.props;
    const inboxSubFolder = folders?.find(item => item.folderName === 'Inbox');

    return (
      <ModalBox isVisible={show}>
        <ModalContent style={{ width: UI_SIZES.screen.width - 80 }}>
          <View style={styles.containerView}>
            <View style={styles.moveTextContainer}>
              <BodyText>{I18n.t('zimbra-move-to')}</BodyText>
            </View>
            <ScrollView style={[styles.scrollViewContainer, { height: UI_SIZES.screen.width }]}>
              <View style={[styles.actionsContainers, styles.messagesContainer]}>
                <BodyText>{I18n.t('zimbra-messages')}</BodyText>
              </View>
              {this.renderOption('inbox', I18n.t('zimbra-inbox'), 'inbox')}
              {this.renderOption(this.findMainFolderId('Sent'), I18n.t('zimbra-outbox'), 'send')}
              {this.renderOption(this.findMainFolderId('Drafts'), I18n.t('zimbra-drafts'), 'insert_drive_file')}
              {this.renderOption(this.findMainFolderId('Trash'), I18n.t('zimbra-trash'), 'delete')}
              {this.renderOption(this.findMainFolderId('Junk'), I18n.t('zimbra-spams'), 'delete_sweep')}
              {inboxSubFolder !== undefined && inboxSubFolder.folders !== undefined && inboxSubFolder.folders.length > 0 && (
                <View>
                  <View style={[styles.actionsContainers, styles.directoriesContainer]}>
                    <BodyText>{I18n.t('zimbra-directories')}</BodyText>
                  </View>
                  <View>{inboxSubFolder.folders.map(f => this.renderOption(f.id, f.folderName, 'folder'))}</View>
                </View>
              )}
            </ScrollView>
            <View style={styles.actionsButtonsContainer}>
              <DialogButtonOk label={I18n.t('zimbra-move')} onPress={this.confirm} />
              <DialogButtonCancel onPress={closeModal} />
            </View>
          </View>
        </ModalContent>
      </ModalBox>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    folders: getRootFolderListState(state).data,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      moveToFolder: moveMailsToFolderAction,
      moveToInbox: moveMailsToInboxAction,
    },
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(MoveToFolderModal);
