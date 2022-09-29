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
import { ValidatorBuilder } from '~/utils/form';

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

export const SendEmailVerificationCodeScreen = ({
  defaultEmail,
  sendAction,
  isSending,
  refuseAction,
}: {
  defaultEmail: string;
  sendAction: (email: string) => void;
  isSending: boolean;
  refuseAction: () => void;
}) => {
  const [email, setEmail] = React.useState(defaultEmail || '');
  const [isEmailValid, setIsEmailValid] = React.useState(true);
  const emailValidator = new ValidatorBuilder().withEmail().build<string>();
  const isEmailFormatValid = emailValidator.isValid(email);
  const isEmailEmpty = email === '';

  const changeEmail = (text: string) => {
    if (!isEmailFormatValid) setIsEmailValid(true);
    setEmail(text);
  };
  const sendEmail = () => {
    if (isEmailFormatValid) {
      sendAction(email);
    } else setIsEmailValid(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <View style={styles.imageSubContainer}>
          <NamedSVG name="empty-email" width={imageWidth} height={imageHeight} />
        </View>
      </View>
      <HeadingSText style={styles.title}>{I18n.t('user.sendEmailVerificationCodeScreen.emailVerification')}</HeadingSText>
      <SmallText style={styles.content}>{I18n.t('user.sendEmailVerificationCodeScreen.mustVerify')}</SmallText>
      <View style={styles.inputTitleContainer}>
        <Icon name="messagerie-off" size={22} color={theme.palette.grey.black} />
        <SmallBoldText style={styles.inputTitle}>{I18n.t('user.sendEmailVerificationCodeScreen.emailAddress')}</SmallBoldText>
      </View>
      <TextInput
        autoCorrect={false}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder={I18n.t('user.sendEmailVerificationCodeScreen.typeEmailAddress')}
        placeholderTextColor={theme.palette.grey.black}
        underlineColorAndroid={theme.palette.grey.grey}
        style={[styles.input, { borderColor: isEmailValid ? theme.palette.grey.stone : theme.palette.status.failure }]}
        value={email}
        onChangeText={text => changeEmail(text)}
      />
      <CaptionItalicText style={styles.errorText}>
        {I18n.t(isEmailValid ? 'common.space' : 'user.sendEmailVerificationCodeScreen.invalidEmailFormat')}
      </CaptionItalicText>
      <ActionButton
        style={styles.sendButton}
        text={I18n.t('user.sendEmailVerificationCodeScreen.verifyMyEmail')}
        disabled={isEmailEmpty}
        loading={isSending}
        action={() => sendEmail()}
      />
      <TouchableOpacity style={styles.logoutButton} onPress={() => refuseAction()}>
        <SmallBoldText style={styles.logoutText}>
          {I18n.t('user.sendEmailVerificationCodeScreen.refuseAndDisconnect')}
        </SmallBoldText>
      </TouchableOpacity>
    </View>
  );
};
