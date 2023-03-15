import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-tiny-toast';

import theme from '~/app/theme';
import ModalBox, { ModalBoxHandle } from '~/framework/components/ModalBox';
import ActionButton from '~/framework/components/buttons/action';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { BodyText, SmallText } from '~/framework/components/text';
import { ISession } from '~/framework/modules/auth/model';
import { ISignature } from '~/framework/modules/zimbra/model';
import { zimbraService } from '~/framework/modules/zimbra/service';

const styles = StyleSheet.create({
  isGlobalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.medium,
  },
  isGlobalText: {
    marginLeft: UI_SIZES.spacing.minor,
  },
  textInput: {
    marginVertical: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.minor,
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.ui.border.input,
    borderWidth: 1,
    borderRadius: 5,
    color: theme.ui.text.regular,
    minHeight: 70,
    maxHeight: 140,
  },
});

const getGlobalValue = (signature: ISignature): boolean => {
  const { preference } = signature;
  let signatureCheck = false;

  if (preference !== undefined) {
    if (typeof preference === 'object') signatureCheck = preference.useSignature;
    else signatureCheck = JSON.parse(preference).useSignature;
  }
  return signatureCheck;
};

interface ISignatureModalProps {
  signatureData: ISignature;
  signatureText: string;
  session?: ISession;
  successCallback: () => any;
}

const SignatureModal = React.forwardRef<ModalBoxHandle, ISignatureModalProps>((props, ref) => {
  const [text, setText] = React.useState(props.signatureText);
  const [isGlobal, setGlobal] = React.useState(getGlobalValue(props.signatureData));
  const [isUpdating, setUpdating] = React.useState<boolean>(false);

  React.useEffect(() => {
    setGlobal(getGlobalValue(props.signatureData));
  }, [props.signatureData]);

  const updateSignature = async () => {
    try {
      const { session } = props;

      setUpdating(true);
      if (!session) throw new Error();
      await zimbraService.signature.update(session, text, isGlobal);
      props.successCallback();
      setUpdating(false);
    } catch {
      setUpdating(false);
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  return (
    <ModalBox
      ref={ref}
      content={
        <View>
          <BodyText>{I18n.t('zimbra-signature')}</BodyText>
          <TextInput
            defaultValue={props.signatureText}
            onChangeText={value => setText(value)}
            multiline
            textAlignVertical="top"
            style={styles.textInput}
          />
          <TouchableOpacity onPress={() => setGlobal(!isGlobal)} style={styles.isGlobalContainer}>
            <Checkbox checked={isGlobal} onPress={() => setGlobal(!isGlobal)} />
            <SmallText style={styles.isGlobalText}>{I18n.t('zimbra-signature-use')}</SmallText>
          </TouchableOpacity>
          <ActionButton text={I18n.t('zimbra-add')} action={updateSignature} loading={isUpdating} />
        </View>
      }
    />
  );
});

export default SignatureModal;
