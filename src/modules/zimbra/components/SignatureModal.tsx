import I18n from "i18n-js";
import * as React from "react";
import { View, StyleSheet, CheckBox } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import { DialogButtonCancel, DialogButtonOk } from "../../../ui/ConfirmDialog";
import { ModalBox, ModalContent } from "../../../ui/Modal";
import { Text } from "../../../ui/Typography";

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
  isFetching: boolean;
};

export default class SignatureModal extends React.Component<SignatureModalProps, any> {
  constructor(props) {
    super(props);

    this.state = {
      signature: this.props.signature,
    };
  }

  componentDidUpdate = () => {
    const { signatureMail } = this.props;
    if (signatureMail && signatureMail !== undefined && typeof signatureMail === "string") {
      if (this.state.signature !== JSON.parse(signatureMail).signature) {
        this.props.setSignature(JSON.parse(signatureMail).signature);
        this.props.setGlobalSignature(JSON.parse(signatureMail).useSignature);
        this.setState({ signature: JSON.parse(signatureMail).signature });
      }
    }
  };

  public render() {
    const { show, closeModal, confirm } = this.props;
    return (
      <ModalBox isVisible={show}>
        <ModalContent>
          <View style={style.containerView}>
            <View style={{ alignSelf: "baseline", paddingBottom: 8, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 18, color: "black" }}>{I18n.t("zimbra-signature")}</Text>
            </View>
            <TextInput
              textAlignVertical="top"
              multiline
              style={style.textZone}
              defaultValue={this.props.signature}
              onChangeText={(text: string) => this.props.setSignature(text)}
            />
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <CheckBox value={this.props.isGlobalSignature} onValueChange={this.props.toggleGlobal} />
              <Text style={{ paddingTop: 6 }}>{I18n.t("zimbra-signature-use")}</Text>
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
    marginHorizontal: 16,
    borderBottomWidth: 0.5,
    borderStyle: "dotted",
    borderColor: "grey",
  },
});
