import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { SmallBoldText } from '~/framework/components/text';
import { postFolderAction } from '~/framework/modules/conversation/actions/folders';
import { fetchInitAction } from '~/framework/modules/conversation/actions/initMails';
import { DialogButtonCancel, DialogButtonOk } from '~/ui/ConfirmDialog';
import { ModalBox, ModalContent, ModalContentBlock } from '~/ui/Modal';

export type ConversationCreateFolderModalEventProps = {
  createFolder: (name: string, parentId?: string) => void;
  fetchInit: () => void;
  onClose: () => void;
};
export type ConversationCreateFolderModalDataProps = {
  show: boolean;
};
export type ConversationCreateFolderModalProps = ConversationCreateFolderModalEventProps & ConversationCreateFolderModalDataProps;

interface ConversationCreateFolderModalState {
  name: string;
}

class CreateFolderModal extends React.PureComponent<ConversationCreateFolderModalProps, ConversationCreateFolderModalState> {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
    };
  }

  onNameChange = newName => {
    this.setState({ name: newName });
  };

  onConfirm = async () => {
    const { createFolder, fetchInit, onClose } = this.props;
    const { name } = this.state;
    try {
      await createFolder(name);
      fetchInit();
      onClose();
      Toast.show(I18n.t('conversation.createDirectoryConfirm'), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: '95%', backgroundColor: theme.palette.grey.black },
        ...UI_ANIMATIONS.toast,
      });
    } catch (error) {
      const folderAlreadyExists = (error as Error).message === 'conversation.error.duplicate.folder';
      onClose();
      Toast.show(I18n.t(folderAlreadyExists ? 'conversation.createDirectoryError.folderExists' : 'common.error.text'), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: '95%', backgroundColor: theme.palette.grey.black },
        ...UI_ANIMATIONS.toast,
      });
    } finally {
      this.setState({ name: '' });
    }
  };

  public render() {
    const { name } = this.state;
    const { show, onClose } = this.props;
    const textInputStyle = {
      color: theme.ui.text.regular,
    } as ViewStyle;
    //FIXME: create/move to styles.ts
    const styles = StyleSheet.create({
      inputContainer: { width: '100%', marginBottom: UI_SIZES.spacing.big, paddingHorizontal: UI_SIZES.spacing.medium },
      modalContent: { width: 350 },
      modalContentBlock: { flexDirection: 'row' },
    });
    // Ignore ModalBox lint errors
    return (
      <ModalBox isVisible={show} backdropOpacity={0.5}>
        <ModalContent style={styles.modalContent}>
          <ModalContentBlock>
            <SmallBoldText>{I18n.t('conversation.createDirectory')}</SmallBoldText>
          </ModalContentBlock>
          <View style={styles.inputContainer}>
            <TextInput
              autoFocus
              value={name}
              onChangeText={this.onNameChange}
              placeholder={I18n.t('conversation.directoryName')}
              underlineColorAndroid={theme.palette.grey.grey}
              style={textInputStyle}
            />
          </View>
          <ModalContentBlock style={styles.modalContentBlock}>
            <DialogButtonCancel onPress={onClose} />
            <DialogButtonOk disabled={!name} label={I18n.t('conversation.create')} onPress={this.onConfirm} />
          </ModalContentBlock>
        </ModalContent>
      </ModalBox>
    );
  }
}

const mapStateToProps = (state: IGlobalState) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      createFolder: postFolderAction,
      fetchInit: fetchInitAction,
    },
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateFolderModal);
