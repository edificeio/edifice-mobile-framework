import * as TYPES from "../constants/docs"

/**
 * Read a REST resource
 *
 * @param {string} path       l'URI de la ressource
 */
export const read = (path, synced = true) => ({
	path,
	type: TYPES.READ,
	synced,
})

/**
 * Rest read success
 * This method is call by the system.
 *
 * @param {string} path             l'URI de la ressource
 * @param {object} payload          les données lus
 */
export const readSuccess = (path, payload) => ({
	payload,
	path,
	type: TYPES.READ_SUCCESS,
	synced: false,
})

/**
 * Read REST resource identified by its path and id. L'uri is <path>/<id>
 *
 * @param {string} path    uri de la ressource
 * @param {number} id      id de la ressource
 */
export const readId = (path, id, synced = true) => ({
	path,
	id,
	type: TYPES.READ,
	synced,
})

/**
 * Success de lecture de la ressource REST identifiée par l'uri <path>/<id>
 * Cette methode est appelé par le système. Elle n'a pas à etre appelée explicitement
 *
 * @param {string} path             l'URI de la ressource
 * @param {object} payload          les données lus
 */
export const readIdSuccess = (path, id, payload) => ({
	payload,
	path,
	id,
	type: TYPES.READ_SUCCESS,
	synced: false,
})

/**
 * Creation d'une ressource REST
 *
 * @param {string} path       uri de la ressource
 * @param {object} payload    données de la ressource
 */
export const create = (path, payload, synced = true) => ({
	payload,
	path,
	type: TYPES.CREATE,
	synced,
})

/**
 * Success d'ecriture de la ressource REST
 * Cette methode est appelé par le système. Elle n'a pas à etre appelée explicitement
 *
 * @param {string} path             l'URI de la ressource
 * @param {object} payload          les données lus
 */
export const createSuccess = (path, payload) => ({
	path,
	payload,
	type: TYPES.CREATE_SUCCESS,
	synced: false,
})

/**
 * Update d'une ressource REST
 *
 * @param {string} path       uri parent de la ressource
 * @param {object} payload    données de la ressource contenant l'id de la ressource
 */
export const update = (path, payload) => ({
	path,
	payload,
	type: TYPES.UPDATE,
	synced: true,
})

/**
 * Success de mise à jour de la ressource REST
 * Cette methode est appelé par le système. Elle n'a pas à etre appelée explicitement
 *
 * @param {string} path             l'URI de la ressource
 * @param {object} payload          les données lus
 */
export const updateSuccess = (path, payload) => ({
	path,
	payload,
	type: TYPES.UPDATE_SUCCESS,
	synced: false,
})

/**
 * Delete d'une ressource REST
 *
 * @param {string} path       uri parent de la ressource
 * @param {object} payload    données de la ressource contenant l'id de la ressource
 */
export const del = (path, payload) => ({
	path,
	payload,
	type: TYPES.DELETE,
	synced: true,
})

/**
 * Success du delete de la ressource REST
 * Cette methode est appelé par le système. Elle n'a pas à etre appelée explicitement
 *
 * @param {string} path             l'URI parent de la ressource
 * @param {object} payload          les données de la ressource
 */
export const delSuccess = (path, payload) => ({
	path,
	payload,
	type: TYPES.DELETE_SUCCESS,
	synced: false,
})

/**
 * Error returned by CRUD action
 *
 * @param type
 * @param path
 * @param payload
 */
export const crudError = (type, path, payload) => ({
	type,
	path,
	payload,
	synced: false,
})

/**
 * Action error permitting to notify a input field is in error
 *
 * @param code        error code
 * @param message     message associated to this error code. If message is null, no error
 */
export const error = (code, message) => ({
	type: "_ERROR",
	path: "/ERR",
	payload: { code, message },
	synced: false,
})

export const resetErrors = () => ({
	type: "_ERROR",
	path: "/ERR",
	payload: {},
	synced: false,
})
