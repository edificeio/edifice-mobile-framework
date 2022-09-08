import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallBoldText } from '~/framework/components/text';
import { fetchRootFoldersAction, postFolderAction } from '~/modules/zimbra/actions/folders';
import { DialogButtonCancel, DialogButtonOk } from '~/ui/ConfirmDialog';
import { ModalBox, ModalContent, ModalContentBlock } from '~/ui/Modal';

const styles = StyleSheet.create({
  modalContainer: {
    width: 350,
  },
  directoryNameContainer: {
    width: '100%',
    marginBottom: UI_SIZES.spacing.large,
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  row: {
    flexDirection: 'row',
  },
});

type CreateFolderModalProps = {
  show: boolean;
  onClose: () => void;
  createFolder: (name: string) => void;
  fetchRootFolders: () => void;
};

type CreateFolderModalState = {
  name: string;
};

class CreateFolderModal extends React.PureComponent<CreateFolderModalProps, CreateFolderModalState> {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
    };
  }

  onNameChange = newName => {
    this.setState({
      name: newName,
    });
  };

  onConfirm = async () => {
    await this.props.createFolder(this.state.name);
    await this.props.fetchRootFolders();
    this.props.onClose();

    Toast.show(I18n.t('zimbra-create-directory-confirm'));
    this.setState({ name: '' });
  };

  public render() {
    const { name } = this.state;
    const { show } = this.props;
    const textInputStyle = {
      color: theme.ui.text.regular,
      borderBottomWidth: 0.5,
      borderColor: theme.palette.grey.cloudy,
    } as ViewStyle;
    return (
      <ModalBox isVisible={show} backdropOpacity={0.5}>
        <ModalContent style={styles.modalContainer}>
          <ModalContentBlock>
            <SmallBoldText>{I18n.t('zimbra-create-directory')}</SmallBoldText>
          </ModalContentBlock>

          <View style={styles.directoryNameContainer}>
            <TextInput
              value={name}
              onChangeText={this.onNameChange}
              placeholder={I18n.t('zimbra-directory-name')}
              style={textInputStyle}
            />
          </View>
          <ModalContentBlock style={styles.row}>
            <DialogButtonCancel onPress={this.props.onClose} />
            <DialogButtonOk disabled={!this.state.name} label={I18n.t('zimbra-create')} onPress={this.onConfirm} />
          </ModalContentBlock>
        </ModalContent>
      </ModalBox>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      createFolder: postFolderAction,
      fetchRootFolders: fetchRootFoldersAction,
    },
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateFolderModal);
