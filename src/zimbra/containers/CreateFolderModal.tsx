import I18n from "i18n-js";
import React from "react";
import { View } from "react-native";
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
        <ModalContent style={{ width: 350 }}>
          <ModalContentBlock>
            <TextBold>{I18n.t("zimbra-create-directory")}</TextBold>
          </ModalContentBlock>

          <View style={{ width: "100%", marginBottom: 35, paddingHorizontal: 20 }}>
            <TextInput
              value={name}
              onChangeText={this.onNameChange}
              placeholder={I18n.t("zimbra-directory-name")}
              underlineColorAndroid="grey"
            />
          </View>
          <ModalContentBlock style={{ flexDirection: "row" }}>
            <DialogButtonCancel onPress={this.props.onClose} />
            <DialogButtonOk disabled={!this.state.name} label={I18n.t("zimbra-create")} onPress={this.onConfirm} />
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
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateFolderModal);
