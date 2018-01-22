import { CREATE_SUCCESS, DELETE_SUCCESS, READ_SUCCESS, UPDATE_SUCCESS } from "../constants/docs"
import { match, matchs, PATH_LOGIN, PATH_LOGOUT } from "../constants/paths"

/**
 * The base reducer
 *
 * @param {object} state          the reducer state
 * @param {string[]} paths           the rest resource(s) of the reducer.
 * @param {object} action         the redux action
 * @param {string} payloadName    the object identifier to read from the response
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
		return { ...state, synced: false }
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
				return {
					type: action.type,
					path,
					synced: true,
					payload,
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
						type: action.type,
						path,
						synced: true,
						payload: res,
					}
				}
				return {
					type: action.type,
					path,
					synced: true,
					payload: [...state.payload, payload],
				}
			}
			return {
				type: action.type,
				synced: true,
				path,
				payload,
			}

		case DELETE_SUCCESS:
			if (state.payload instanceof Array) {
				const payload = payloadName ? action.payload[payloadName] : action.payload
				const res = state.payload.filter(doc => doc.id !== payload.id)
				return {
					type: action.type,
					synced: true,
					path,
					payload: res,
				}
			}
			return {
				type: action.type,
				synced: true,
				path,
				payload: {},
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
