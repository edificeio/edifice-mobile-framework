import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

import theme from '~/app/theme';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_SIZES } from '~/framework/components/constants';
import { Text, TextSizeStyle } from '~/framework/components/text';
import { DialogButtonCancel, DialogButtonOk } from '~/ui/ConfirmDialog';
import { ModalBox, ModalContent } from '~/ui/Modal';

const styles = StyleSheet.create({
  containerView: {
    flexGrow: 1,
    width: '100%',
    marginTop: -25,
  },
  titleContainer: {
    alignSelf: 'baseline',
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  titleText: {
    ...TextSizeStyle.SlightBig,
  },
  textZone: {
    marginHorizontal: 10,
    borderBottomWidth: 0.5,
    borderColor: theme.palette.grey.cloudy,
    maxHeight: UI_SIZES.screen.height / 4,
  },
  infosView: {
    flexDirection: 'row',
    marginTop: 10,
    marginHorizontal: 10,
  },
  useSignatureText: {
    paddingTop: 3,
    paddingLeft: 10,
  },
  actionsButtonsContainer: {
    flexDirection: 'row-reverse',
    padding: 20,
    paddingBottom: 10,
  },
});

type SignatureModalProps = {
  isGlobalSignature: boolean;
  show: boolean;
  signature: string;
  signatureMail: string;
  setSignature: (signature: string) => any;
  setGlobalSignature: (isGlobal: boolean) => any;
  toggleGlobal: () => any;
  closeModal: () => any;
  confirm: () => any;
};

export default class SignatureModal extends React.Component<SignatureModalProps> {
  public render() {
    const { show, closeModal, confirm } = this.props;
    return (
      <ModalBox isVisible={show}>
        <ModalContent style={{ width: UI_SIZES.screen.width - 80 }}>
          <View style={styles.containerView}>
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>{I18n.t('zimbra-signature')}</Text>
            </View>
            <TextInput
              textAlignVertical="top"
              multiline
              scrollEnabled
              style={styles.textZone}
              defaultValue={this.props.signature}
              onChangeText={(text: string) => this.props.setSignature(text)}
            />
            <View style={styles.infosView}>
              <Checkbox checked={this.props.isGlobalSignature} onPress={this.props.toggleGlobal} />
              <Text style={styles.useSignatureText}>{I18n.t('zimbra-signature-use')}</Text>
            </View>
            <View style={styles.actionsButtonsContainer}>
              <DialogButtonOk label={I18n.t('zimbra-add')} onPress={confirm} />
              <DialogButtonCancel onPress={closeModal} />
            </View>
          </View>
        </ModalContent>
      </ModalBox>
    );
  }
}
