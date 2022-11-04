/**
 * Send email verification code component
 */
import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/ActionButton';
import { UI_SIZES, getScaleDimension } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { CaptionItalicText, HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';

const imageWidth = getScaleDimension(150, 'width');
const imageHeight = getScaleDimension(150, 'height');
const styles = StyleSheet.create({
  container: { paddingHorizontal: UI_SIZES.spacing.big },
  imageContainer: { paddingTop: UI_SIZES.spacing.medium },
  imageSubContainer: { height: imageHeight, alignItems: 'center' },
  title: { textAlign: 'center', marginTop: UI_SIZES.spacing.medium },
  content: { textAlign: 'center', marginTop: UI_SIZES.spacing.medium },
  inputTitleContainer: { alignItems: 'center', marginTop: UI_SIZES.spacing.big, flexDirection: 'row' },
  inputTitle: { marginLeft: UI_SIZES.spacing.minor },
  input: {
    borderWidth: UI_SIZES.dimensions.width.tiny,
    marginTop: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
    borderRadius: UI_SIZES.radius.medium,
  },
  errorText: { color: theme.palette.status.failure, marginTop: UI_SIZES.spacing.tiny },
  sendButton: { marginTop: UI_SIZES.spacing.medium },
  logoutButton: { alignSelf: 'center', marginTop: UI_SIZES.spacing.medium },
  logoutText: { color: theme.palette.status.failure },
});

export enum EmailState {
  PRISTINE = 'pristine',
  EMAIL_FORMAT_INVALID = 'emailFormatInvalid',
  EMAIL_ALREADY_VERIFIED = 'emailAlreadyVerified',
}

export const SendEmailVerificationCodeScreen = ({
  defaultEmail,
  sendAction,
  isSending,
  refuseAction,
  isModifyingEmail,
}: {
  defaultEmail: string;
  sendAction: (email: string) => Promise<EmailState | undefined>;
  isSending: boolean;
  refuseAction: () => void;
  isModifyingEmail: boolean;
}) => {
  const [email, setEmail] = React.useState(defaultEmail || '');
  const [emailState, setEmailState] = React.useState<EmailState>(EmailState.PRISTINE);
  const isEmailEmpty = email === '';
  const isEmailStatePristine = emailState === EmailState.PRISTINE;
  const isEmailStateAlreadyVerified = emailState === EmailState.EMAIL_ALREADY_VERIFIED;
  const modifyString = isModifyingEmail ? 'Modify' : '';
  const errorString = I18n.t(
    isEmailStatePristine
      ? 'common.space'
      : `user.sendEmailVerificationCodeScreen.invalidEmailFormat${isEmailStateAlreadyVerified ? 'Modify' : ''}`,
  );
  const borderColor = isEmailStatePristine ? theme.palette.grey.stone : theme.palette.status.failure;

  const changeEmail = (text: string) => {
    if (!isEmailStatePristine) setEmailState(EmailState.PRISTINE);
    setEmail(text);
  };
  const sendEmail = async () => {
    const sendResponse = await sendAction(email);
    if (sendResponse) setEmailState(sendResponse);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <View style={styles.imageSubContainer}>
          <NamedSVG name="empty-email" width={imageWidth} height={imageHeight} />
        </View>
      </View>
      <HeadingSText style={styles.title}>
        {I18n.t(`user.sendEmailVerificationCodeScreen.emailVerification${modifyString}`)}
      </HeadingSText>
      <SmallText style={styles.content}>{I18n.t(`user.sendEmailVerificationCodeScreen.mustVerify${modifyString}`)}</SmallText>
      <View style={styles.inputTitleContainer}>
        <Icon name="messagerie-off" size={22} color={theme.palette.grey.black} />
        <SmallBoldText style={styles.inputTitle}>
          {I18n.t(`user.sendEmailVerificationCodeScreen.emailAddress${modifyString}`)}
        </SmallBoldText>
      </View>
      <TextInput
        autoCorrect={false}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder={I18n.t('user.sendEmailVerificationCodeScreen.typeEmailAddress')}
        placeholderTextColor={theme.palette.grey.black}
        style={[styles.input, { borderColor }]}
        value={email}
        onChangeText={text => changeEmail(text)}
      />
      <CaptionItalicText style={styles.errorText}>{errorString}</CaptionItalicText>
      <ActionButton
        style={styles.sendButton}
        text={I18n.t('user.sendEmailVerificationCodeScreen.verifyMyEmail')}
        disabled={isEmailEmpty}
        loading={isSending}
        action={() => sendEmail()}
      />
      {isModifyingEmail ? null : (
        <TouchableOpacity style={styles.logoutButton} onPress={() => refuseAction()}>
          <SmallBoldText style={styles.logoutText}>
            {I18n.t('user.sendEmailVerificationCodeScreen.refuseAndDisconnect')}
          </SmallBoldText>
        </TouchableOpacity>
      )}
    </View>
  );
};