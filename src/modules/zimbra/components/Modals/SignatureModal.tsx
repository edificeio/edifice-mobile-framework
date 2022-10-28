import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import theme from '~/app/theme';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyText, SmallText } from '~/framework/components/text';
import { ISignature } from '~/modules/zimbra/state/signature';
import { DialogButtonCancel, DialogButtonOk } from '~/ui/ConfirmDialog';
import { ModalBox, ModalContent } from '~/ui/Modal';

// STYLE ----------------------------------------------------------------------

const styles = StyleSheet.create({
  containerView: {
    flexGrow: 1,
    width: '100%',
    marginTop: -UI_SIZES.spacing.big,
  },
  titleContainer: {
    alignSelf: 'baseline',
    paddingBottom: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,
  },
  textZone: {
    marginHorizontal: UI_SIZES.spacing.small,
    borderBottomWidth: 0.5,
    borderColor: theme.palette.grey.cloudy,
    maxHeight: UI_SIZES.screen.height / 4,
  },
  infosView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: UI_SIZES.spacing.small,
    marginHorizontal: UI_SIZES.spacing.small,
  },
  useSignatureText: {
    marginLeft: UI_SIZES.spacing.minor,
  },
  actionsButtonsContainer: {
    flexDirection: 'row-reverse',
    padding: UI_SIZES.spacing.medium,
    paddingBottom: UI_SIZES.spacing.small,
  },
});

// COMPONENTS -----------------------------------------------------------------

const setGlobal = (signatureData: ISignature) => {
  const { preference } = signatureData;
  let signatureCheck = false;
  if (preference !== undefined) {
    if (typeof preference === 'object') signatureCheck = preference.useSignature;
    else signatureCheck = JSON.parse(preference).useSignature;
  }
  return signatureCheck;
};

const confirm = async (
  text: string,
  global: boolean,
  closeModal: () => any,
  putSignature: (signatureData: string, isGlobalSignature: boolean) => any,
  successCallback: () => any,
) => {
  closeModal();
  await putSignature(text, global);
  successCallback();
};

// EXPORTED COMPONENT AND TYPE ------------------------------------------------

type SignatureModalType = {
  show: boolean;
  signatureText: string;
  signatureData: ISignature;
  closeModal: () => any;
  putSignature: (signatureData: string, isGlobalSignature: boolean) => any;
  successCallback: () => any;
};

export const SignatureModal = ({
  show,
  signatureText,
  signatureData,
  closeModal,
  putSignature,
  successCallback,
}: SignatureModalType) => {
  const [currentGlobal, toggleGlobal] = React.useState(setGlobal(signatureData));
  const textUpdateTimeout = React.useRef();
  const [currentText, updateCurrentText] = React.useState(signatureText);

  React.useEffect(() => toggleGlobal(setGlobal(signatureData)), [signatureData]);

  React.useEffect(() => {
    window.clearTimeout(textUpdateTimeout.current);
    textUpdateTimeout.current = window.setTimeout(() => updateCurrentText(currentText), 500);

    return () => {
      window.clearTimeout(textUpdateTimeout.current);
    };
  }, [currentText]);

  return (
    <ModalBox isVisible={show}>
      <ModalContent style={{ width: UI_SIZES.screen.width - 80 }}>
        <View style={styles.containerView}>
          <View style={styles.titleContainer}>
            <BodyText>{I18n.t('zimbra-signature')}</BodyText>
          </View>
          <TextInput
            textAlignVertical="top"
            multiline
            scrollEnabled
            style={styles.textZone}
            defaultValue={signatureText}
            onChangeText={(text: string) => updateCurrentText(text)}
          />
          <View style={styles.infosView}>
            <Checkbox checked={currentGlobal} onPress={() => toggleGlobal(!currentGlobal)} />
            <SmallText style={styles.useSignatureText}>{I18n.t('zimbra-signature-use')}</SmallText>
          </View>
          <View style={styles.actionsButtonsContainer}>
            <DialogButtonOk
              label={I18n.t('zimbra-add')}
              onPress={() => confirm(currentText, currentGlobal, closeModal, putSignature, successCallback)}
            />
            <DialogButtonCancel onPress={closeModal} />
          </View>
        </View>
      </ModalContent>
    </ModalBox>
  );
};
