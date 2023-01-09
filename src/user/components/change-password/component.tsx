import styled from '@emotion/native';
import I18n from 'i18n-js';
import * as React from 'react';
import { Pressable, View } from 'react-native';

import { ActionButton } from '~/framework/components/action-button';
import AlertCard from '~/framework/components/alert';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { KeyboardPageView } from '~/framework/components/page';
import { BodyText, SmallText } from '~/framework/components/text';
import { Loading } from '~/ui/Loading';
import { TextInputLine } from '~/ui/forms/TextInputLine';
import ChangePasswordFormModel from '~/user/components/change-password/form-model';
import { ContextState, SubmitState } from '~/utils/SubmitState';
import { ValueChange, ValueChangeArgs } from '~/utils/form';

import styles from './styles';
import { IChangePasswordPageProps, IChangePasswordPageState, IFields } from './types';

function OldPasswordField(props: { oldPassword: string; form: ChangePasswordFormModel; onChange: ValueChange<string> }) {
  const validator = props.form.oldPassword;
  return (
    <TextInputLine
      isPasswordField
      inputRef={ref => (props.form.inputOldPassword = ref)}
      placeholder={I18n.t('PasswordOld')}
      onChangeText={validator.changeCallback(props.onChange)}
      value={props.oldPassword}
      hasError={props.form.showOldPasswordError(props.oldPassword)}
    />
  );
}
function NewPasswordField(props: { newPassword: string; form: ChangePasswordFormModel; onChange: ValueChange<string> }) {
  const validator = props.form.newPassword;
  return (
    <TextInputLine
      isPasswordField
      inputRef={ref => (props.form.inputNewPassword = ref)}
      placeholder={I18n.t('PasswordNew')}
      onChangeText={validator.changeCallback(props.onChange)}
      value={props.newPassword}
      hasError={props.form.showNewPasswordError(props.newPassword)}
    />
  );
}
function PasswordConfirmField(props: { confirm: string; form: ChangePasswordFormModel; onChange: ValueChange<string> }) {
  const validator = props.form.confirm;
  return (
    <TextInputLine
      isPasswordField
      inputRef={ref => (props.form.inputPasswordConfirm = ref)}
      placeholder={I18n.t('PasswordNewConfirm')}
      onChangeText={validator.changeCallback(props.onChange)}
      value={props.confirm}
      hasError={props.form.showPasswordConfirmError(props.confirm)}
    />
  );
}
const FormContainer = styled.View({
  alignItems: 'stretch',
  flexGrow: 1,
  flexShrink: 0,
  justifyContent: 'space-between',
  paddingTop: UI_SIZES.spacing.big,
  paddingHorizontal: UI_SIZES.spacing.big,
});
const ButtonWrapper = styled.View({
  alignItems: 'center',
  flex: 0,
  justifyContent: 'flex-start',
  marginTop: UI_SIZES.spacing.small,
});
const MiniSpacer = styled.View({
  marginTop: UI_SIZES.spacing.small,
});

export class ChangePasswordPage extends React.PureComponent<IChangePasswordPageProps, IChangePasswordPageState> {
  public state: IChangePasswordPageState = {
    oldPassword: '',
    newPassword: '',
    confirm: '',
    typing: false,
    showExternalError: true,
  };

  private handleSubmit() {
    this.props.onSubmit(
      { ...this.state },
      this.props.navigation.getParam('redirectCallback'),
      this.props.navigation.getParam('forceChange'),
    );
    this.setState({ typing: false, showExternalError: true });
  }

  private onChange = (key: IFields) => {
    return (valueChange: ValueChangeArgs<string>) => {
      const newState: Partial<IChangePasswordPageState> = {
        [key]: valueChange.value,
        typing: true,
        showExternalError: false,
      };
      this.setState(newState as any);
    };
  };

  public componentDidMount() {
    const props = this.props;
    props.onRetryLoad({
      login: props.session?.user.login!,
    });
  }

  public render() {
    const { externalError, contextState, submitState } = this.props;
    const { oldPassword, newPassword, confirm, typing, showExternalError } = this.state;

    if (contextState === ContextState.Loading) {
      return <Loading />;
    }

    if (contextState === ContextState.Failed) {
      return (
        <KeyboardPageView
          isFocused={false}
          navigation={this.props.navigation}
          scrollable
          navBarWithBack={{
            title: I18n.t('PasswordChange'),
          }}>
          <EmptyContentScreen />
        </KeyboardPageView>
      );
    }

    const formModel = new ChangePasswordFormModel({
      ...this.props,
      oldPassword: () => oldPassword,
      newPassword: () => newPassword,
    });
    const isNotValid = !formModel.validate({ ...this.state });
    const errorKey = formModel.firstErrorKey({ ...this.state });
    const errorText = errorKey ? I18n.t(errorKey) : showExternalError && externalError;
    const hasErrorKey = !!errorText;
    const isSubmitLoading = submitState === SubmitState.Loading;
    const showError = this.state.newPassword.length > 0 || this.state.confirm.length > 0;

    return (
      <KeyboardPageView
        isFocused={false}
        navigation={this.props.navigation}
        scrollable
        navBarWithBack={{
          title: I18n.t('PasswordChange'),
        }}>
        <Pressable onPress={() => formModel.blur()} style={styles.pressable}>
          <FormContainer>
            <View style={styles.viewInfoForm}>
              {this.props.navigation.getParam('isLoginNavigator') ? (
                <View style={styles.viewWarning}>
                  <BodyText style={styles.textWarning}>{I18n.t('PasswordChangeWarning')}</BodyText>
                  <MiniSpacer />
                  <MiniSpacer />
                </View>
              ) : null}

              {this.props.passwordRegexI18n?.[I18n.currentLocale()] ? (
                <AlertCard type="info" text={this.props.passwordRegexI18n?.[I18n.currentLocale()]} />
              ) : null}
            </View>
            <View style={styles.noFlexShrink}>
              <OldPasswordField oldPassword={oldPassword} form={formModel} onChange={this.onChange('oldPassword')} />
              <MiniSpacer />
            </View>
            <View style={styles.noFlexShrink}>
              <NewPasswordField newPassword={newPassword} form={formModel} onChange={this.onChange('newPassword')} />
              <MiniSpacer />
            </View>
            <View style={styles.noFlexShrink}>
              <PasswordConfirmField confirm={confirm} form={formModel} onChange={this.onChange('confirm')} />
              <MiniSpacer />
            </View>
            <View style={styles.noFlexShrink}>
              <SmallText style={styles.textError}>
                {showError && hasErrorKey && (errorKey !== 'changePassword-errorConfirm' || this.state.confirm.length > 0)
                  ? errorText
                  : ' \n '}
              </SmallText>
            </View>
            <View style={styles.noFlexShrink}>
              <ButtonWrapper error={hasErrorKey} typing={typing}>
                <ActionButton
                  action={() => this.handleSubmit()}
                  disabled={isNotValid}
                  text={I18n.t('Save')}
                  loading={isSubmitLoading}
                />
              </ButtonWrapper>
              <MiniSpacer />
              <MiniSpacer />
              <MiniSpacer />
            </View>
          </FormContainer>
        </Pressable>
      </KeyboardPageView>
    );
  }
}
