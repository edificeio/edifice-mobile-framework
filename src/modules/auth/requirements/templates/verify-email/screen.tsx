import * as React from 'react';
import { Keyboard, TextInput, TouchableOpacity, View } from 'react-native';

import { useIsFocused } from '@react-navigation/native';

import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import { KeyboardAvoidingView } from '~/framework/components/keyboard';
import { Picture, Svg } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import { CaptionItalicText, HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import usePreventBack from '~/framework/hooks/prevent-back';
import { isEmpty } from '~/framework/util/object';
import { ValidatorBuilder } from '~/util/form';
import { I18n } from '~/util/i18n';

import styles from './styles';
import { EmailState, type PageTexts, type RequirementVerifyEmailScreenTemplateProps } from './types';

// Framework `ScrollView` instance type lacks `scrollToEnd`: loosened locally.
type ScrollViewRef = { scrollToEnd: () => void };

/**
 * The user must verify its email. The template does not know what happens next: it only calls the given actions.
 */
export const RequirementVerifyEmailScreenTemplate = React.memo(function ({
  defaultEmail,
  onRefuse,
  onSubmit,
}: RequirementVerifyEmailScreenTemplateProps) {
  const isScreenFocused = useIsFocused();

  const texts: PageTexts = {
    button: I18n.get('auth-change-email-verify-button'),
    label: I18n.get('auth-change-email-verify-label'),
    message: I18n.get('auth-change-email-verify-message'),
    title: I18n.get('auth-change-email-verify-title'),
  };

  const [isSendingCode, setIsSendingCode] = React.useState(false);
  const [email, setEmail] = React.useState(defaultEmail || '');
  const [emailState, setEmailState] = React.useState<EmailState>(EmailState.PRISTINE);
  const isEmailEmpty = isEmpty(email);
  const isEmailStatePristine = emailState === EmailState.PRISTINE;

  const sendEmail = React.useCallback(async () => {
    // Exit if email is not valid
    if (!new ValidatorBuilder().withEmail().build<string>().isValid(email)) {
      setEmailState(EmailState.EMAIL_FORMAT_INVALID);
      return;
    }
    try {
      setIsSendingCode(true);
      await onSubmit(email);
    } catch {
      Toast.showError(I18n.get('auth-change-email-error-text'));
    } finally {
      setIsSendingCode(false);
    }
  }, [email, onSubmit]);

  const onChangeEmail = React.useCallback(
    (text: string) => {
      if (!isEmailStatePristine) setEmailState(EmailState.PRISTINE);
      setEmail(text);
    },
    [isEmailStatePristine],
  );

  const refuseEmailVerification = React.useCallback(async () => {
    try {
      await onRefuse();
    } catch {
      Toast.showError(I18n.get('auth-change-email-error-text'));
    }
  }, [onRefuse]);

  usePreventBack({
    showAlert: !isEmailEmpty && isScreenFocused,
    text: I18n.get('auth-change-email-edit-alert-message'),
    title: I18n.get('auth-change-email-edit-alert-title'),
  });

  const scrollViewRef = React.useRef<ScrollViewRef>(null);
  React.useEffect(() => {
    const listener = Keyboard.addListener('keyboardDidShow', () => {
      scrollViewRef.current?.scrollToEnd();
    });
    return () => {
      listener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView>
      <ScrollView ref={scrollViewRef as React.Ref<never>} style={styles.page}>
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <Svg name="user-email" width={UI_SIZES.elements.thumbnail} height={UI_SIZES.elements.thumbnail} />
          </View>
          <HeadingSText style={styles.title} testID="email-change-title">
            {texts.title}
          </HeadingSText>
          <SmallText style={styles.content} testID="email-change-subtitle">
            {texts.message}
          </SmallText>
          <View style={styles.inputTitleContainer} testID="email-field-label">
            <Picture
              type="Svg"
              name="pictos-mail"
              fill={theme.palette.grey.black}
              width={UI_SIZES.dimensions.width.mediumPlus}
              height={UI_SIZES.dimensions.height.mediumPlus}
            />
            <SmallBoldText style={styles.inputTitle}>{texts.label}</SmallBoldText>
          </View>
          <View
            style={[
              styles.inputWrapper,
              { borderColor: isEmailStatePristine ? theme.palette.grey.stone : theme.palette.status.failure.regular },
            ]}>
            <TextInput
              autoCorrect={false}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder={I18n.get('auth-change-email-placeholder')}
              placeholderTextColor={theme.palette.grey.graphite}
              style={styles.input}
              value={email}
              onChangeText={onChangeEmail}
              returnKeyType="send"
              {...(!isEmailEmpty ? { onSubmitEditing: sendEmail } : {})}
              testID="email-field"
            />
          </View>
          <CaptionItalicText style={styles.errorText} testID="email-field-error">
            {isEmailStatePristine ? I18n.get('common-space') : I18n.get('auth-change-email-error-invalid')}
          </CaptionItalicText>
          <PrimaryButton
            style={styles.sendButton}
            text={texts.button}
            disabled={isEmailEmpty}
            loading={isSendingCode}
            action={sendEmail}
            testID="email-check"
          />
          <TouchableOpacity style={styles.logoutButton} onPress={refuseEmailVerification}>
            <SmallBoldText style={styles.logoutText}>{I18n.get('auth-change-email-verify-disconnect')}</SmallBoldText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});
RequirementVerifyEmailScreenTemplate.displayName = 'RequirementVerifyEmailScreenTemplate';
