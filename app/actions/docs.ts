import * as TYPES from "../constants/docs"

export interface IAction {
	type: string
	path: string
	synced?: boolean
	merge?: boolean
	form?: boolean,
	payload?: object
	id?: string
}

/**
 * Read a REST resource
 *
 * @param {string} path       l'URI de la ressource
 * @param {boolean} synced    say if yourglass displayer
 *
 */
export const read = (path, synced = false): IAction => ({
	path,
	synced,
	type: TYPES.READ,
})

/**
 * Read next REST resource (merge result with the state)
 *
 * @param {string} path       l'URI de la ressource
 * @param {boolean} synced    say if yourglass displayer
 *
 */
export const readNext = (path, synced = false): IAction => ({
	merge: true,
	path,
	synced,
	type: TYPES.READ,
})

/**
 * Rest read success
 * This method is call by the system.
 *
 * @param action           the initial action
 * @param payload          les données lus
 */
export const readSuccess = (action: IAction, payload: object): IAction => ({
	...action,
	payload,
	synced: false,
	type: TYPES.READ_SUCCESS,
})

/**
 * Read REST resource identified by its path and id. L'uri is <path>/<id>
 *
 * @param {string} path    uri de la ressource
 * @param {number} id      id de la ressource
 */
export const readId = (path, id): IAction => ({
	id,
	path,
	synced: false,
	type: TYPES.READ,
})

/**
 * Success de lecture de la ressource REST identifiée par l'uri <path>/<id>
 * Cette methode est appelé par le système. Elle n'a pas à etre appelée explicitement
 *
 * @param action           			the initial action
 * @param {object} payload          les données lus
 */
export const readIdSuccess = (action, payload): IAction => ({
	...action,
	payload,
	synced: false,
	type: TYPES.READ_SUCCESS,
})

/**
 * Creation d'une ressource REST
 *
 * @param {string} path       uri de la ressource
 * @param {object} payload    données de l'action
 */
export const create = (path, payload, synced): IAction => ({
	path,
	payload,
	synced,
	type: TYPES.CREATE,
})

/**
 * Creation d'une ressource REST
 *
 * @param {string} path       uri de la ressource
 * @param {object} payload    données de l'action
 */
export const createWithFormData = (path, payload, synced): IAction => ({
	form: true,
	path,
	payload,
	synced,
	type: TYPES.CREATE,
})

/**
 * Success d'ecriture de la ressource REST
 * Cette methode est appelé par le système. Elle n'a pas à etre appelée explicitement
 *
 * @param action           			the initial action
 * @param {object} payload          les données lus
 */
export const createSuccess = (action, payload): IAction => ({
	...action,
	payload,
	synced: false,
	type: TYPES.CREATE_SUCCESS,
})

/**
 * Update d'une ressource REST
 *
 * @param {string} path       uri parent de la ressource
 * @param {object} payload    données de la ressource contenant l'id de la ressource
 */
export const update = (path, payload): IAction => ({
	path,
	payload,
	synced: false,
	type: TYPES.UPDATE,
})

/**
 * Success de mise à jour de la ressource REST
 * Cette methode est appelé par le système. Elle n'a pas à etre appelée explicitement
 *
 * @param action           			the initial action
 * @param {object} payload          les données lus
 */
export const updateSuccess = (action, payload): IAction => ({
	...action,
	payload,
	synced: false,
	type: TYPES.UPDATE_SUCCESS,
})

/**
 * Delete d'une ressource REST
 *
 * @param {string} path       uri parent de la ressource
 * @param {object} payload    données de la ressource contenant l'id de la ressource
 */
export const del = (path, payload): IAction => ({
	path,
	payload,
	synced: false,
	type: TYPES.DELETE,
})

/**
 * Success du delete de la ressource REST
 * Cette methode est appelé par le système. Elle n'a pas à etre appelée explicitement
 *
 * @param action           			the initial action
 * @param {object} payload          les données de la ressource
 */
export const delSuccess = (action: IAction, payload): IAction => ({
	...action,
	payload,
	synced: false,
	type: TYPES.DELETE_SUCCESS,
})

/**
 * Error returned by CRUD action
 *
 * @param type
 * @param path
 * @param payload
 */
export const crudError = (type, action, payload, response = { ok: true, status: 200, statusText: "" }): IAction => ({
	...action,
	payload: { ok: response.ok, status: response.status, statusText: response.statusText, ...payload },
	synced: false,
	type,
})

/**
 * Action error permitting to notify a input field is in error
 *
 * @param code        error code
 * @param message     message associated to this error code. If message is null, no error
 */
export const error = (code, message): IAction => ({
	path: "/ERR",
	payload: { code, message },
	synced: false,
	type: "_ERROR",
})

export const resetErrors = (): IAction  => ({
	path: "/ERR",
	payload: {},
	synced: false,
	type: "_ERROR",
})
