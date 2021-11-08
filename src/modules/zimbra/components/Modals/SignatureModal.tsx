import I18n from "i18n-js";
import * as React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import { CommonStyles } from "../../../../styles/common/styles";
import { DialogButtonCancel, DialogButtonOk } from "../../../../ui/ConfirmDialog";
import { ModalBox, ModalContent } from "../../../../ui/Modal";
import { Text } from "../../../../ui/Typography";
import { SquareCheckbox } from "../../../../ui/forms/Checkbox";

type SignatureModalProps = {
  show: boolean;
  signature: string;
  isGlobalSignature: boolean;
  setSignature: (signature: string) => any;
  setGlobalSignature: (isGlobal: boolean) => any;
  toggleGlobal: () => any;
  closeModal: () => any;
  confirm: () => any;
  signatureMail: string;
};

export default class SignatureModal extends React.Component<SignatureModalProps> {
  public render() {
    const { show, closeModal, confirm } = this.props;
    return (
      <ModalBox isVisible={show}>
        <ModalContent style={{ width: Dimensions.get("window").width - 80 }}>
          <View style={style.containerView}>
            <View style={{ alignSelf: "baseline", paddingBottom: 8, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 18, color: "black" }}>{I18n.t("zimbra-signature")}</Text>
            </View>
            <TextInput
              textAlignVertical="top"
              multiline
              scrollEnabled
              style={style.textZone}
              defaultValue={this.props.signature}
              onChangeText={(text: string) => this.props.setSignature(text)}
            />
            <View style={style.infosView}>
              <SquareCheckbox
                value={this.props.isGlobalSignature}
                color={CommonStyles.primary}
                onChange={this.props.toggleGlobal}
              />
              <Text style={{ paddingTop: 3, paddingLeft: 10 }}>{I18n.t("zimbra-signature-use")}</Text>
            </View>
            <View style={{ flexDirection: "row-reverse", padding: 20, paddingBottom: 10 }}>
              <DialogButtonOk label={I18n.t("zimbra-add")} onPress={confirm} />
              <DialogButtonCancel onPress={closeModal} />
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
    width: "100%",
    marginTop: -25,
  },
  textZone: {
    marginHorizontal: 10,
    borderBottomWidth: 0.5,
    borderColor: "lightgrey",
    maxHeight: Dimensions.get("window").height / 4,
  },
  infosView: {
    flexDirection: "row",
    marginTop: 10,
    marginHorizontal: 10,
  },
});
