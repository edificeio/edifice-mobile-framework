export const ID_PHONE = -101
export const ID_FIRST_NAME = -102
export const ID_LAST_NAME = -103
export const ID_CARD_BANK = -104
export const INVALID_PASSWORD = -1
export const PSEUDO_INCONNU = -2
export const INVALID_EMAIL = -3

export const phone_too_short = "Numero de téléphone invalide"
export const too_short = "Donnée trop courte"
export const card_bank_empty = "Renseigner le numero de carte bancaire"

export function errorAlreadyCatched(error) {
	if (
		error === ID_PHONE ||
		error === ID_FIRST_NAME ||
		error === ID_LAST_NAME ||
		error === ID_CARD_BANK ||
		error === INVALID_PASSWORD ||
		error === PSEUDO_INCONNU ||
		error === INVALID_EMAIL
	) {
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
	cardBank: [ID_CARD_BANK],
	email: [INVALID_EMAIL],
	first_name: [ID_FIRST_NAME],
	last_name: [ID_LAST_NAME],
	password: [INVALID_PASSWORD],
	phone: [ID_PHONE],
	pseudo: [PSEUDO_INCONNU],
}
