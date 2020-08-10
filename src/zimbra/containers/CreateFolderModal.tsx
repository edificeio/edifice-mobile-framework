import I18n from "i18n-js";
import React from "react";
import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import Toast from "react-native-tiny-toast";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { DialogButtonOk, DialogButtonCancel } from "../../ui/ConfirmDialog";
import { ModalBox, ModalContent, ModalContentBlock } from "../../ui/Modal";
import { TextBold } from "../../ui/Typography";
import { postFolderAction } from "../actions/folders";

class CreateFolderModal extends React.PureComponent<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
    };
  }

  onNameChange = newName => {
    this.setState({
      name: newName,
    });
  };

  onConfirm = () => {
    this.props.createFolder(this.state.name);
    this.props.onClose();
    Toast.show(I18n.t("zimbra-create-directory-confirm"), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: "95%", backgroundColor: "black" },
    });
  };

  public render() {
    const { name } = this.state;
    const { show } = this.props;
    return (
      <ModalBox isVisible={show} backdropOpacity={0.5}>
        <ModalContent>
          <TextBold style={style.modalTitle}>{I18n.t("zimbra-create-directory")}</TextBold>
          <TextInput
            value={name}
            onChangeText={this.onNameChange}
            style={style.modalInput}
            placeholder={I18n.t("zimbra-directory-name")}
            underlineColorAndroid="grey"
          />
          <ModalContentBlock>
            <View style={style.buttonsContainer}>
              <DialogButtonCancel onPress={this.props.onClose} />
              <DialogButtonOk label={I18n.t("zimbra-create")} onPress={this.onConfirm} />
            </View>
          </ModalContentBlock>
        </ModalContent>
      </ModalBox>
    );
  }
}

const style = StyleSheet.create({
  buttonsContainer: {
    flexDirection: "row",
  },
  modalTitle: { fontSize: 18, marginBottom: 5 },
  modalInput: { width: "80%", marginBottom: 10 },
});

const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      createFolder: postFolderAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateFolderModal);
