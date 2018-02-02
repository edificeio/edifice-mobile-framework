import { tr } from "../i18n/t"

export function errorAlreadyCatched(error) {
	if (error === tr.Incorrect_login_or_password) {
		return true
	}

	return false
}

/**
 * Associate input fields to errors code
 *
 * @type {{email: [null], password: [null], pseudo: [null], messageAppel: [null], first_name: [null], last_name: [null], phone: [null], cardBank: [null]}}
 */
export const ERR_INPUT = {
	login: [tr.Incorrect_login_or_password],
	email: [],
}
