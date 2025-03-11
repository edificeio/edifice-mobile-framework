import * as React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import AlertCard from '~/framework/components/alert';
import PrimaryButton from '~/framework/components/buttons/primary';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_SIZES } from '~/framework/components/constants';
import ModalBox, { ModalBoxHandle } from '~/framework/components/ModalBox';
import { BodyText, SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { ISignature } from '~/framework/modules/zimbra/model';
import { zimbraService } from '~/framework/modules/zimbra/service';
import { isSignatureRich } from '~/framework/modules/zimbra/utils/drafts';
import HtmlContentView from '~/ui/HtmlContentView';

const styles = StyleSheet.create({
  alertContainer: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  disabledInput: {
    backgroundColor: theme.palette.grey.pearl,
  },
  isGlobalContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.medium,
  },
  isGlobalText: {
    marginLeft: UI_SIZES.spacing.minor,
  },
  textInput: {
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.ui.border.input,
    borderRadius: 5,
    borderWidth: 1,
    color: theme.ui.text.regular,
    marginVertical: UI_SIZES.spacing.medium,
    maxHeight: 140,
    minHeight: 70,
    padding: UI_SIZES.spacing.minor,
  },
});

interface ISignatureModalProps {
  signature: ISignature;
  session?: AuthLoggedAccount;
  onChange: (text: string) => void;
}

const SignatureModal = React.forwardRef<ModalBoxHandle, ISignatureModalProps>((props, ref) => {
  const [content, setContent] = React.useState<string>(props.signature.content);
  const [isGlobal, setGlobal] = React.useState<boolean>(props.signature.useSignature);
  const [isRichContent, setRichContent] = React.useState<boolean>(isSignatureRich(props.signature.content));
  const [isUpdating, setUpdating] = React.useState<boolean>(false);

  React.useEffect(() => {
    setContent(props.signature.content);
    setGlobal(props.signature.useSignature);
    setRichContent(isSignatureRich(props.signature.content));
  }, [props.signature]);

  const updateSignature = async () => {
    try {
      const { session } = props;

      setUpdating(true);
      if (!session) throw new Error();
      await zimbraService.signature.update(session, content, isGlobal);
      props.onChange(content);
      setUpdating(false);
    } catch {
      setUpdating(false);
      Toast.showError(I18n.get('zimbra-composer-signaturemodal-error-text'));
    }
  };

  return (
    <ModalBox
      ref={ref}
      content={
        <View>
          <BodyText>{I18n.get('zimbra-composer-signaturemodal-title')}</BodyText>
          {isRichContent ? (
            <React.Fragment>
              <HtmlContentView html={content} style={[styles.textInput, styles.disabledInput]} />
              <AlertCard type="info" text={I18n.get('zimbra-composer-signaturemodal-richinfo')} style={styles.alertContainer} />
            </React.Fragment>
          ) : (
            <TextInput
              value={content}
              onChangeText={value => setContent(value)}
              multiline
              textAlignVertical="top"
              style={styles.textInput}
            />
          )}
          <TouchableOpacity onPress={() => setGlobal(!isGlobal)} style={styles.isGlobalContainer}>
            <Checkbox checked={isGlobal} onPress={() => setGlobal(!isGlobal)} />
            <SmallText style={styles.isGlobalText}>{I18n.get('zimbra-composer-signaturemodal-globaluse')}</SmallText>
          </TouchableOpacity>
          <PrimaryButton text={I18n.get('zimbra-composer-signaturemodal-action')} action={updateSignature} loading={isUpdating} />
        </View>
      }
    />
  );
});

export default SignatureModal;
