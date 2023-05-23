import * as React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import ModalBox, { ModalBoxHandle } from '~/framework/components/ModalBox';
import ActionButton from '~/framework/components/buttons/action';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyText, SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
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

interface ISignatureModalProps {
  signature: ISignature;
  session?: ISession;
  onChange: (text: string) => void;
}

const SignatureModal = React.forwardRef<ModalBoxHandle, ISignatureModalProps>((props, ref) => {
  const [text, setText] = React.useState<string>(props.signature.preference.signature);
  const [isGlobal, setGlobal] = React.useState<boolean>(props.signature.preference.useSignature);
  const [isUpdating, setUpdating] = React.useState<boolean>(false);

  React.useEffect(() => {
    setText(props.signature.preference.signature);
    setGlobal(props.signature.preference.useSignature);
  }, [props.signature.preference]);

  const updateSignature = async () => {
    try {
      const { session } = props;

      setUpdating(true);
      if (!session) throw new Error();
      await zimbraService.signature.update(session, text, isGlobal);
      props.onChange(text);
      setUpdating(false);
    } catch {
      setUpdating(false);
      Toast.showError(I18n.get('common.error.text'));
    }
  };

  return (
    <ModalBox
      ref={ref}
      content={
        <View>
          <BodyText>{I18n.get('zimbra-signature')}</BodyText>
          <TextInput
            value={text}
            onChangeText={value => setText(value)}
            multiline
            textAlignVertical="top"
            style={styles.textInput}
          />
          <TouchableOpacity onPress={() => setGlobal(!isGlobal)} style={styles.isGlobalContainer}>
            <Checkbox checked={isGlobal} onPress={() => setGlobal(!isGlobal)} />
            <SmallText style={styles.isGlobalText}>{I18n.get('zimbra-signature-use')}</SmallText>
          </TouchableOpacity>
          <ActionButton text={I18n.get('zimbra-add')} action={updateSignature} loading={isUpdating} />
        </View>
      }
    />
  );
});

export default SignatureModal;
