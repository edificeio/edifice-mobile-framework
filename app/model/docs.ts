import { CREATE_SUCCESS, DELETE_SUCCESS, READ_SUCCESS, UPDATE_SUCCESS } from "../constants/docs"
import { match, matchs, PATH_LOGIN, PATH_LOGOUT } from "../constants/paths"

/**
 * The base reducer
 *
 * @param {object} state          the reducer state
 * @param {string[]} paths           the rest resource(s) of the reducer.
 * @param {object} action         the redux action
 * @param {string} payloadName    the object identifier to read from the response, "-1" if return without payload (only for object)
 * @returns {*}
 */
export const crudReducer = (state, paths: string[], action, payloadName: string = null) => {
	if (!matchPaths(paths, action)) {
		return state
	}

	const { path } = action

	if (action.type.indexOf("_REQUEST") > 0) {
		return { ...state, synced: action.synced, id: action.id ? action.id : "" }
	}
	if (action.type.indexOf("_ERROR") > 0) {
		return { ...state, synced: true }
	}

	switch (action.type) {
		case READ_SUCCESS:
		case CREATE_SUCCESS:
		case UPDATE_SUCCESS:
			const payload = payloadName ? action.payload[payloadName] || action.payload : action.payload

			// la donnée n'est pas retourné par l'appel, on ne fait rien
			if (payload === null) {
				return state
			}

			if (payload instanceof Array) {
				if (payload.length === 0)
					return {
						...state,
						synced: true,
					}

				const { pageNumber = 0, merge = false } = action
				return {
					path,
					pageNumber,
					payload: merge ? [...state.payload, ...payload] : payload,
					synced: true,
					type: action.type,
				}
			}

			if (state.payload instanceof Array) {
				// Pas d'id permettant d'identifier l'objet, on ne fait rien
				if (payload.id === undefined) {
					return state
				}

				let found = false
				const res = state.payload.map(doc => {
					if (payload.id && doc.id && doc.id === payload.id) {
						found = true
						return payload
					}
					return doc
				})
				if (found) {
					return {
						path,
						payload: res,
						synced: true,
						type: action.type,
					}
				}
				return {
					path,
					payload: [...state.payload, payload],
					synced: true,
					type: action.type,
				}
			}
			if (payloadName !== "-1") {
				return {
					path,
					payload: { ...state.payload, ...payload },
					synced: true,
					type: action.type,
				}
			} else {
				return {
					...state,
					path,
					synced: true,
					type: action.type,
					...payload,
				}
			}

		case DELETE_SUCCESS:
			if (state.payload instanceof Array) {
				const payload = payloadName ? action.payload[payloadName] : action.payload
				const res = state.payload.filter(doc => doc.id !== payload.id)
				return {
					path,
					payload: res,
					synced: true,
					type: action.type,
				}
			}
			if (payloadName !== "-1") {
				return {
					path,
					payload: {},
					synced: true,
					type: action.type,
				}
			} else {
				return {
					path,
					synced: true,
					type: action.type,
				}
			}

		default:
			return state
	}
}

function id() {
	return Math.random()
		.toString(36)
		.substring(7)
}

/**
 * Check if the path match with the action path
 *
 * @param {string[]} pathToMatch  the rest resource of the reducer
 * @param {string} path           the action path
 * @param {string} type           the action type
 * @returns {boolean}
 */
function matchPaths(pathToMatch, { path, type }) {
	for (let i = 0; i < pathToMatch.length; i++) {
		if (matchElem(pathToMatch[i], { path, type })) {
			return true
		}
	}
	return false
}

function matchElem(pathToMatch, { path = "", type = "" }) {
	return match(pathToMatch, path) && type.length > 0
}
