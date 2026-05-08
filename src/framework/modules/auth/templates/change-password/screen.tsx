import * as React from 'react';
import { Pressable, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import PrimaryButton from '~/framework/components/buttons/primary';
import InputContainer from '~/framework/components/inputs/container';
import PasswordInput from '~/framework/components/inputs/password';
import TextInput from '~/framework/components/inputs/text';
import { TextInputType } from '~/framework/components/inputs/text/component';
import { KeyboardPageView } from '~/framework/components/page';
import { Svg } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { useConstructor } from '~/framework/hooks/constructor';
import { IChangePasswordError } from '~/framework/modules/auth/model';
import { AccountError } from '~/framework/modules/auth/model/error';
import { selectors } from '~/framework/modules/auth/redux/reducer';
import { loadAuthContextAction } from '~/framework/modules/auth/thunks';
import appConf from '~/framework/util/appConf';
import { OAuth2Error } from '~/framework/util/oauth2';
import { Loading } from '~/ui/Loading';
import { ValueChangeArgs } from '~/utils/form';

import ChangePasswordFormModel from './form-model';
import styles from './styles';
import { AuthChangePasswordScreenProps, IFields } from './types';

const ChangePasswordScreen = (props: AuthChangePasswordScreenProps) => {
  const { context, FormFooterComponent, FormHeaderComponent, onSubmit, prefill: _oldPassword, prefillLock, prefillType } = props;

  const passwordRules = React.useMemo(
    () =>
      context.passwordRegexI18n?.[I18n.getLanguage()] ? (
        <View style={styles.infos}>
          <Svg name="ui-lock-alternate" />
          <SmallText style={styles.infosText} testID="change-password-rules">
            {context.passwordRegexI18n?.[I18n.getLanguage()]}
          </SmallText>
        </View>
      ) : null,
    [context.passwordRegexI18n],
  );

  const [oldPassword, setOldPassword] = React.useState(_oldPassword ?? '');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [typing, setTyping] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [submitState, setSumitState] = React.useState<'IDLE' | 'RUNNING'>('IDLE');

  const doSubmit = React.useCallback(async () => {
    try {
      setError(undefined);
      setSumitState('RUNNING');

      await onSubmit({
        confirm,
        newPassword,
        oldPassword,
      });
      Toast.showSuccess(I18n.get('auth-changepassword-success'));
    } catch (e) {
      const changePwdError = e as IChangePasswordError;
      // We don't show toaster if it's login error since that case is handled by redirecting the user to the login page, with error displayed.
      if (!(e instanceof AccountError) && !(e instanceof OAuth2Error)) {
        Toast.showError(I18n.get('toast-error-text'), { testID: 'toaster-error-password' });
      }
      setError(changePwdError.error);
      setSumitState('IDLE');
      setTyping(false);
    }
  }, [confirm, newPassword, oldPassword, onSubmit]);

  const formModel = React.useMemo(
    () =>
      new ChangePasswordFormModel({
        newPassword: () => newPassword,
        oldPassword: () => oldPassword,
        passwordRegex: context.passwordRegex,
      }),
    [context.passwordRegex, newPassword, oldPassword],
  );

  const isNotValid = React.useMemo(
    () => !formModel.validate({ confirm, newPassword, oldPassword }),
    [confirm, formModel, newPassword, oldPassword],
  );
  const errorKey = React.useMemo(
    () => formModel.firstErrorKey({ confirm, newPassword, oldPassword }),
    [confirm, formModel, newPassword, oldPassword],
  );
  const errorText = React.useMemo(() => (errorKey ? I18n.get(errorKey) : typing ? undefined : error), [error, errorKey, typing]);
  const isSubmitLoading = submitState === 'RUNNING';

  const inputOldPassword = React.useRef<TextInputType>(null);
  const inputNewPassword = React.useRef<TextInputType>(null);
  const inputConfirmPassword = React.useRef<TextInputType>(null);

  const onFormBlur = React.useCallback(() => {
    inputOldPassword.current?.blur();
    inputNewPassword.current?.blur();
    inputConfirmPassword.current?.blur();
  }, []);

  const onChange = React.useCallback((key: IFields) => {
    return (valueChange: ValueChangeArgs<string>) => {
      if (key === 'oldPassword') setOldPassword(valueChange.value);
      if (key === 'newPassword') setNewPassword(valueChange.value);
      if (key === 'confirm') setConfirm(valueChange.value);
      setTyping(true);
    };
  }, []);

  return (
    <KeyboardPageView scrollable safeArea={false}>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.page}>
        <Pressable onPress={onFormBlur} style={styles.pressable}>
          {FormHeaderComponent && (React.isValidElement(FormHeaderComponent) ? FormHeaderComponent : <FormHeaderComponent />)}
          {passwordRules}
          <InputContainer
            label={{
              icon: prefillType === 'password' ? 'ui-lock' : 'ui-user',
              testID: 'change-password-actual-label',
              text:
                prefillType === 'password' ? I18n.get('auth-changepassword-password-old') : I18n.get('auth-changepassword-login'),
            }}
            input={
              prefillType === 'password' ? (
                <PasswordInput
                  placeholder={I18n.get('auth-changepassword-placeholder')}
                  showStatusIcon
                  showError={formModel.showOldPasswordError(oldPassword)}
                  value={oldPassword}
                  onChangeText={formModel.oldPassword.changeCallback(onChange('oldPassword'))}
                  annotation=" "
                  disabled={prefillLock}
                  ref={inputOldPassword}
                  onSubmitEditing={() => inputNewPassword.current?.focus()}
                  returnKeyType="next"
                  testID="change-password-actual-field"
                  testIDToggle="change-password-actual-see"
                />
              ) : (
                <TextInput
                  ref={inputOldPassword}
                  onChangeText={formModel.oldPassword.changeCallback(onChange('oldPassword'))}
                  value={oldPassword}
                  keyboardType="email-address"
                  disabled={prefillLock}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  testID="login-identifier"
                  onSubmitEditing={() => inputNewPassword.current?.focus()}
                  returnKeyType="next"
                  annotation=" "
                />
              )
            }
          />
          <InputContainer
            style={styles.inputNewPassword}
            label={{
              icon: 'ui-lock',
              testID: 'change-password-new-label',
              text: I18n.get('auth-changepassword-password-new'),
            }}
            input={
              <PasswordInput
                placeholder={I18n.get('auth-changepassword-placeholder')}
                showStatusIcon
                showError={formModel.showNewPasswordError(newPassword)}
                value={newPassword}
                onChangeText={formModel.newPassword.changeCallback(onChange('newPassword'))}
                annotation={formModel.showNewPasswordError(newPassword) ? errorText : ' '}
                ref={inputNewPassword}
                onSubmitEditing={() => inputConfirmPassword.current?.focus()}
                returnKeyType="next"
                testID="change-password-new-field"
                testIDToggle="change-password-new-see"
                testIDCaption="change-password-new-error"
              />
            }
          />
          <InputContainer
            label={{
              icon: 'ui-lock',
              testID: 'change-password-confirmed-label',
              text: I18n.get('auth-changepassword-password-new-confirm'),
            }}
            input={
              <PasswordInput
                placeholder={I18n.get('auth-changepassword-placeholder')}
                showStatusIcon
                showError={formModel.showPasswordConfirmError(confirm)}
                value={confirm}
                onChangeText={formModel.confirm.changeCallback(onChange('confirm'))}
                annotation={formModel.showPasswordConfirmError(confirm) ? errorText : ' '}
                ref={inputConfirmPassword}
                returnKeyType="send"
                onSubmitEditing={isNotValid ? () => {} : () => doSubmit()}
                testID="change-password-confirmed-field"
                testIDToggle="change-password-confirmed-see"
                testIDCaption="change-password-confirmed-error"
              />
            }
          />
          <View style={styles.buttons}>
            <PrimaryButton
              action={doSubmit}
              disabled={isNotValid}
              text={I18n.get('common-save')}
              loading={isSubmitLoading}
              testID="change-password"
            />
            {/*{props.route.params.forceChange ? (
            <DefaultButton
              text={I18n.get('user-revalidateterms-refuseanddisconnect')}
              contentColor={theme.palette.status.failure.regular}
              style={{ marginTop: UI_SIZES.spacing.big }}
              action={doRefuseTerms}
            />
          ) : null}*/}
          </View>
          {FormFooterComponent && (React.isValidElement(FormFooterComponent) ? FormFooterComponent : <FormFooterComponent />)}
        </Pressable>
      </SafeAreaView>
    </KeyboardPageView>
  );
};

/**
 * Ensures host and hostContext exists for ChangePasswordScreen rendering.
 * @param props
 * @returns
 */
const ChangePasswordScreenLoader = (
  props: Omit<AuthChangePasswordScreenProps, 'context'> & Partial<Pick<AuthChangePasswordScreenProps, 'context'>>,
) => {
  const { host } = props;
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const context = useSelector(selectors.hostContext(host));

  useConstructor(async () => {
    if (!context && host) {
      dispatch(loadAuthContextAction(appConf.getHost(host)));
    }
  });

  if (!context) return <Loading />;
  else return <ChangePasswordScreen {...props} context={context} />;
};

export default ChangePasswordScreenLoader;
