import * as React from 'react';
import { TextInput } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { IActivationPayload } from '~/framework/modules/auth/model';
import { TextInputLine } from '~/ui/forms/TextInputLine';
import { IValidatorContext, ValidatorBuilder, ValueChange, ValueChangeArgs, ValueGetter } from '~/utils/form';

export type { ValueChangeArgs };
//
// Form model: describe fields and validations for each field
//
export class ActivationFormModel {
  login: IValidatorContext<string>;

  password: IValidatorContext<string>;

  confirm: IValidatorContext<string>;

  email: IValidatorContext<string>;

  phone: IValidatorContext<string>;

  constructor(
    private args: { passwordRegex: string; password: ValueGetter<string>; emailRequired: boolean; phoneRequired: boolean },
  ) {
    this.login = new ValidatorBuilder().withRequired(true).build<string>();
    this.password = new ValidatorBuilder().withRequired(true).withRegex(this.args.passwordRegex).build<string>();
    this.confirm = new ValidatorBuilder().withRequired(true).withCompareString(this.args.password, true).build<string>();
    this.email = new ValidatorBuilder().withRequired(this.args.emailRequired).withEmail().build<string>();
    this.phone = new ValidatorBuilder().withRequired(this.args.phoneRequired).withPhone().build<string>();
  }

  //

  inputLogin?: TextInput;

  inputPassword?: TextInput;

  inputConfirm?: TextInput;

  inputEmail?: TextInput;

  inputPhone?: TextInput;
  //

  private check(errors: string[], valid: boolean, errorKey: string = '') {
    if (!valid) {
      errors.push(errorKey);
    }
    return errors;
  }

  errors(model: IActivationPayload) {
    const errors: string[] = [];
    this.check(errors, this.login.isValid(model.login));
    this.check(errors, this.password.isValid(model.password));
    this.check(errors, this.confirm.isValid(model.confirmPassword));
    this.check(errors, this.email.isValid(model.mail));
    this.check(errors, this.phone.isValid(model.phone));
    return errors;
  }

  firstErrorKey(model: IActivationPayload) {
    const errors = this.errors(model);
    return errors.find(err => !!err && err.trim().length > 0);
  }

  validate(model: IActivationPayload) {
    return this.errors(model).length === 0;
  }

  blur() {
    if (this.inputLogin) this.inputLogin.blur();
    if (this.inputPassword) this.inputPassword.blur();
    if (this.inputConfirm) this.inputConfirm.blur();
    if (this.inputEmail) this.inputEmail.blur();
    if (this.inputPhone) this.inputPhone.blur();
  }

  showLoginError(login: string) {
    return this.login.isNotValid(login) && !!login;
  }

  showPasswordError(password: string) {
    return this.password.isNotValid(password) && !!password;
  }

  showConfirmError(confirm: string) {
    return this.confirm.isNotValid(confirm) && !!confirm;
  }

  showEmailError(email: string) {
    return this.email.isNotValid(email) && !!email;
  }

  showPhoneError(phone: string) {
    return this.phone.isNotValid(phone) && !!phone;
  }
}
///
/// Input components
///
export function InputLogin(props: { login: string; form: ActivationFormModel; onChange: ValueChange<string> }) {
  const validator = props.form.login;
  return (
    <TextInputLine
      inputRef={ref => (props.form.inputLogin = ref)}
      placeholder={I18n.get('auth-activation-login')}
      onChangeText={validator.changeCallback(props.onChange)}
      value={props.login}
      hasError={props.form.showLoginError(props.login)}
      editable={false}
      textColor={theme.ui.text.light}
    />
  );
}
export function InputPassword(props: { password: string; form: ActivationFormModel; onChange: ValueChange<string> }) {
  const validator = props.form.password;
  return (
    <TextInputLine
      isPasswordField
      inputRef={ref => (props.form.inputPassword = ref)}
      placeholder={I18n.get('auth-activation-password')}
      onChangeText={validator.changeCallback(props.onChange)}
      value={props.password}
      hasError={props.form.showPasswordError(props.password)}
    />
  );
}
export function InputPasswordConfirm(props: { confirm: string; form: ActivationFormModel; onChange: ValueChange<string> }) {
  const validator = props.form.confirm;
  return (
    <TextInputLine
      isPasswordField
      inputRef={ref => (props.form.inputConfirm = ref)}
      placeholder={I18n.get('auth-activation-password-confirm')}
      onChangeText={validator.changeCallback(props.onChange)}
      value={props.confirm}
      hasError={props.form.showConfirmError(props.confirm)}
    />
  );
}
export function InputEmail(props: { email: string; form: ActivationFormModel; onChange: ValueChange<string> }) {
  const validator = props.form.email;
  return (
    <TextInputLine
      inputRef={ref => (props.form.inputEmail = ref)}
      placeholder={I18n.get('auth-activation-email')}
      onChangeText={validator.changeCallback(props.onChange)}
      value={props.email}
      hasError={props.form.showEmailError(props.email)}
      keyboardType="email-address"
      autoCorrect={false}
      spellCheck={false}
      autoComplete="off"
    />
  );
}

export function InputPhone(props: { phone: string; form: ActivationFormModel; onChange: ValueChange<string> }) {
  const validator = props.form.phone;
  return (
    <TextInputLine
      inputRef={ref => (props.form.inputPhone = ref)}
      placeholder={I18n.get('user-profile-cellphone')}
      onChangeText={validator.changeCallback(props.onChange)}
      value={props.phone}
      hasError={props.form.showPhoneError(props.phone)}
      keyboardType="phone-pad"
    />
  );
}
