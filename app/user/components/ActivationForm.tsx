import * as React from "react";
import I18n from "i18n-js";
import { TextInputLine } from "../../ui/forms/TextInputLine";
import { TextInput } from "react-native";
import { IActivationModel } from "../actions/activation";

//TODO move validators and builder to utils
///
/// types
///
type IValidator = (value: any) => boolean
type ValueChangeOriginal<T> = (value: T) => void;
export type ValueChangeArgs<T> = { value: T, valid: boolean };
export type ValueChange<T> = (value: ValueChangeArgs<T>) => void;
interface IValidatorContext<T> {
    isValid: IValidator
    isNotValid: IValidator
    changeCallback: (onChange: ValueChange<T>) => ValueChangeOriginal<T>
}
///
/// validators: take as parameter a string and return true if valid
///
function notEmpty(text: string) {
    return text && text.trim().length > 0;
}
function matchRegex(text: string, regex: RegExp | string) {
    if (!text || !regex) {
        return true;//skip validation
    }
    const regexObject = typeof regex == "string" ? new RegExp(regex) : regex;
    return regexObject.test(text)
}
function matchString(text1: string, text2: string) {
    return text1 == text2
}

///
/// validator builder: lets compose multiple validator as one big validator
///
class ValidatorBuilder {
    static MAIL_REGEX = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
    static PHONE_REGEX = /^(00|\+)?(?:[0-9] ?-?\.?){6,14}[0-9]$/;
    validators: IValidator[] = []
    withRequired(required: boolean) {
        if (required) {
            this.validators.push(notEmpty);
        }
        return this;
    }
    withRegex(regex: RegExp | string) {
        this.validators.push((value) => {
            return matchRegex(value, regex)
        })
        return this;
    }
    withPhone() {
        return this.withRegex(ValidatorBuilder.PHONE_REGEX);
    }
    withEmail() {
        return this.withRegex(ValidatorBuilder.MAIL_REGEX);
    }
    withMatchString(other: string) {
        this.validators.push((value) => {
            return matchString(value, other);
        })
        return this;
    }
    build<T>(): IValidatorContext<T> {
        const isValid = (value) => {
            let valid = true;
            for (let va of this.validators) {
                if (!va(value)) {
                    valid = false;
                }
            }
            return valid;
        }
        return {
            isValid,
            isNotValid: (value) => !isValid(value),
            changeCallback(onChange: ValueChange<T>) {
                return (value) => onChange({ value, valid: isValid(value) });
            }
        }
    }
}
//
// Form model: describe fields and validations for each field
//
export class ActivationFormModel {
    constructor(private args: { passwordRegex: string, password: string, emailRequired: boolean, phoneRequired: boolean }) {

    }
    login = new ValidatorBuilder().withRequired(true).build<string>();
    password = new ValidatorBuilder().withRequired(true).withRegex(this.args.passwordRegex).build<string>();
    confirm = new ValidatorBuilder().withRequired(true).withMatchString(this.args.password).build<string>();
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
}
///
/// Input components
///
export function InputLogin(props: { login: string, form: ActivationFormModel, onChange: ValueChange<string> }) {
    const validator = props.form.login;
    return <TextInputLine
        inputRef={(ref) => props.form.inputLogin = ref}
        placeholder={I18n.t("Login")}
        onChangeText={validator.changeCallback(props.onChange)}
        value={props.login}
        hasError={validator.isNotValid(props.login)}
    />
}
export function InputPassword(props: { password: string, form: ActivationFormModel, onChange: ValueChange<string> }) {
    const validator = props.form.password;
    return <TextInputLine
        inputRef={(ref) => props.form.inputPassword = ref}
        placeholder={I18n.t("Password")}
        onChangeText={validator.changeCallback(props.onChange)}
        value={props.password}
        hasError={validator.isNotValid(props.password)}
        secureTextEntry={true}
    />
}
export function InputPasswordConfirm(props: { confirm: string, form: ActivationFormModel, onChange: ValueChange<string> }) {
    const validator = props.form.confirm;
    return <TextInputLine
        inputRef={(ref) => props.form.inputConfirm = ref}
        placeholder={I18n.t("PasswordConfirm")}
        onChangeText={validator.changeCallback(props.onChange)}
        value={props.confirm}
        hasError={validator.isNotValid(props.confirm)}
        secureTextEntry={true}
    />
}
export function InputEmail(props: { email: string, form: ActivationFormModel, onChange: ValueChange<string> }) {
    const validator = props.form.email;
    return <TextInputLine
        inputRef={(ref) => props.form.inputEmail = ref}
        placeholder={I18n.t("Email")}
        onChangeText={validator.changeCallback(props.onChange)}
        value={props.email}
        hasError={validator.isNotValid(props.email)}
        keyboardType="email-address"
    />
}

export function InputPhone(props: { phone: string, form: ActivationFormModel, onChange: ValueChange<string> }) {
    const validator = props.form.phone;
    return <TextInputLine
        inputRef={(ref) => props.form.inputPhone = ref}
        placeholder={I18n.t("Phone")}
        onChangeText={validator.changeCallback(props.onChange)}
        value={props.phone}
        hasError={validator.isNotValid(props.phone)}
        keyboardType="phone-pad"
    />
}
