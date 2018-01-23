import { tr } from "../i18n/t"

export function errorAlreadyCatched(error) {
	if (error === tr.Identifiant_incorrect) {
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
	login: [tr.Identifiant_incorrect],
	email: [],
}
