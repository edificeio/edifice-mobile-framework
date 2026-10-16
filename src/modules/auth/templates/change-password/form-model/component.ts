import type { IChangePasswordModel } from '~/modules/auth/templates/change-password/types';
import { IValidatorContext, ValidatorBuilder, ValueGetter } from '~/util/form';

/** What the form needs from an input: `TextInput` instance type does not declare `blur` in the current RN types. */
type Blurrable = { blur: () => void };

export default class ChangePasswordFormModel {
  oldPassword: IValidatorContext<string>;

  newPassword: IValidatorContext<string>;

  confirm: IValidatorContext<string>;

  constructor(
    private args: {
      passwordRegex: RegExp | string;
      oldPassword: ValueGetter<string>;
      newPassword: ValueGetter<string>;
    },
  ) {
    this.oldPassword = new ValidatorBuilder().withRequired(true).build<string>();
    this.newPassword = new ValidatorBuilder()
      .withRequired(true)
      .withRegex(this.args.passwordRegex)
      .withCompareString(this.args.oldPassword, false)
      .build<string>();
    this.confirm = new ValidatorBuilder().withRequired(true).withCompareString(this.args.newPassword, true).build<string>();
  }

  inputOldPassword?: Blurrable;

  inputNewPassword?: Blurrable;

  inputPasswordConfirm?: Blurrable;

  private check(errors: string[], valid: boolean, errorKey: string = '') {
    if (!valid) {
      errors.push(errorKey);
    }
    return errors;
  }

  errors(model: IChangePasswordModel) {
    const errors: string[] = [];
    this.check(errors, this.oldPassword.isValid(model.oldPassword));
    this.check(errors, this.newPassword.isValid(model.newPassword), 'auth-changepassword-error-regex');
    this.check(errors, this.confirm.isValid(model.confirm), 'auth-changepassword-error-confirm');
    return errors;
  }

  firstErrorKey(model: IChangePasswordModel) {
    const errors = this.errors(model);
    return errors.find(err => !!err && err.trim().length > 0);
  }

  validate(model: IChangePasswordModel) {
    return this.errors(model).length === 0;
  }

  blur() {
    if (this.inputOldPassword) this.inputOldPassword.blur();
    if (this.inputNewPassword) this.inputNewPassword.blur();
    if (this.inputPasswordConfirm) this.inputPasswordConfirm.blur();
  }

  showOldPasswordError(oldPassword: string) {
    return this.oldPassword.isNotValid(oldPassword) && !!oldPassword;
  }

  showNewPasswordError(newPassword: string) {
    return this.newPassword.isNotValid(newPassword) && !!newPassword;
  }

  showPasswordConfirmError(confirm: string) {
    return this.confirm.isNotValid(confirm) && !!confirm;
  }
}
