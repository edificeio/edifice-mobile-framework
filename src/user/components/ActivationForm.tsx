import * as React from "react";
import I18n from "i18n-js";
import { TextInputLine } from "../../ui/forms/TextInputLine";
import { TextInput } from "react-native";
import { IActivationModel } from "../actions/activation";
import { ValueChangeArgs, ValidatorBuilder, ValueChange, ValueGetter } from "../../utils/form";
import theme from "../../app/theme";
export { ValueChangeArgs }
//
// Form model: describe fields and validations for each field
//
export class ActivationFormModel {
    constructor(private args: { passwordRegex: string, password: ValueGetter<string>, emailRequired: boolean, phoneRequired: boolean }) {

    }
    login = new ValidatorBuilder().withRequired(true).build<string>();
    password = new ValidatorBuilder().withRequired(true).withRegex(this.args.passwordRegex).build<string>();
    confirm = new ValidatorBuilder().withRequired(true).withCompareString(this.args.password, true).build<string>();
    email = new ValidatorBuilder().withRequired(this.args.emailRequired).withEmail().build<string>();
    phone = new ValidatorBuilder().withRequired(this.args.phoneRequired).withPhone().build<string>();
    //
    inputLogin?: TextInput
    inputPassword?: TextInput
    inputConfirm?: TextInput
    inputEmail?: TextInput
    inputPhone?: TextInput
    //
    private check(errors: string[], valid: boolean, errorKey: string = "") {
        if (!valid) {
            errors.push(errorKey);
        }
        return errors;
    }
    errors(model: IActivationModel) {
        let errors: string[] = [];
        this.check(errors, this.login.isValid(model.login));
        this.check(errors, this.password.isValid(model.password));
        this.check(errors, this.confirm.isValid(model.confirm));
        this.check(errors, this.email.isValid(model.email));
        this.check(errors, this.phone.isValid(model.phone));
        return errors;
    }
    firstErrorKey(model: IActivationModel) {
        const errors = this.errors(model);
        return errors.find(err => !!err && err.trim().length > 0)
    }
    validate(model: IActivationModel) {
        return this.errors(model).length == 0;
    }
    blur() {
        this.inputLogin && this.inputLogin.blur();
        this.inputPassword && this.inputPassword.blur();
        this.inputConfirm && this.inputConfirm.blur();
        this.inputEmail && this.inputEmail.blur();
        this.inputPhone && this.inputPhone.blur();
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
export function InputLogin(props: { login: string, form: ActivationFormModel, onChange: ValueChange<string> }) {
    const validator = props.form.login;
    return <TextInputLine
        inputRef={(ref) => props.form.inputLogin = ref}
        placeholder={I18n.t("LoginHome")}
        onChangeText={validator.changeCallback(props.onChange)}
        value={props.login}
        hasError={props.form.showLoginError(props.login)}
        editable={false}
        textColor={theme.color.text.light}
    />
}
export function InputPassword(props: { password: string, form: ActivationFormModel, onChange: ValueChange<string> }) {
    const validator = props.form.password;
    return <TextInputLine
        isPasswordField
        inputRef={(ref) => props.form.inputPassword = ref}
        placeholder={I18n.t("Password")}
        onChangeText={validator.changeCallback(props.onChange)}
        value={props.password}
        hasError={props.form.showPasswordError(props.password)}
    />
}
export function InputPasswordConfirm(props: { confirm: string, form: ActivationFormModel, onChange: ValueChange<string> }) {
    const validator = props.form.confirm;
    return <TextInputLine
        isPasswordField
        inputRef={(ref) => props.form.inputConfirm = ref}
        placeholder={I18n.t("PasswordConfirm")}
        onChangeText={validator.changeCallback(props.onChange)}
        value={props.confirm}
        hasError={props.form.showConfirmError(props.confirm)}
    />
}
export function InputEmail(props: { email: string, form: ActivationFormModel, onChange: ValueChange<string> }) {
    const validator = props.form.email;
    return <TextInputLine
        inputRef={(ref) => props.form.inputEmail = ref}
        placeholder={I18n.t("Email")}
        onChangeText={validator.changeCallback(props.onChange)}
        value={props.email}
        hasError={props.form.showEmailError(props.email)}
        keyboardType="email-address"
        autoCorrect={false}
        autoComplete="off"
    />
}

export function InputPhone(props: { phone: string, form: ActivationFormModel, onChange: ValueChange<string> }) {
    const validator = props.form.phone;
    return <TextInputLine
        inputRef={(ref) => props.form.inputPhone = ref}
        placeholder={I18n.t("CellPhone")}
        onChangeText={validator.changeCallback(props.onChange)}
        value={props.phone}
        hasError={props.form.showPhoneError(props.phone)}
        keyboardType="phone-pad"
    />
}
