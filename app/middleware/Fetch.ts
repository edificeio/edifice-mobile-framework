import FormData from "form-data"
import * as docActions from "../actions/docs"
import { Conf } from "../Conf"
import * as TYPES from "../constants/docs"
import {
	matchs,
	PATH_AVATAR,
	PATH_CREATE_CONVERSATION,
	PATH_LOGIN,
	PATH_LOGOUT,
	PATH_NEW_MESSAGES,
	PATH_PREVIOUS_MESSAGES,
	replace1,
} from "../constants/paths"
import { tr } from "../i18n/t"
import { AsyncStorage, Platform } from "react-native"

async function getCookies(response) {
	const cookie = response.headers.get("Set-Cookie")
	if (cookie) return new Promise(resolve => resolve(cookie))
	return await AsyncStorage.getItem("Set-Cookie")
}

function checkResponse(response, path = null) {
	if (response.headers === undefined) {
		return new Promise((resolve, reject) => resolve(response.base64()))
	}

	if (path === PATH_LOGIN) {
		const cookies = getCookies(response)
		if (cookies === null) {
			return new Promise((resolve, reject) =>
				reject({
					loggedIn: false,
					ok: false,
					status: 511,
					statusText: tr.Incorrect_login_or_password,
				})
			)
		}
		// Cookie are not persist on IOS so we use AsyncStorage here
		if (Platform.OS === "ios") {
			AsyncStorage.setItem("Set-Cookie", JSON.stringify(cookies))
		}
		return new Promise(resolve =>
			resolve({
				loggedIn: true,
			})
		)
	}

	if (path === PATH_LOGOUT) {
		return new Promise(resolve =>
			resolve({
				loggedIn: false,
			})
		)
	}

	const contentType = response.headers.get("content-type")

	if (contentType && contentType.indexOf("application/json") !== -1) {
		return response.json()
	}
	return new Promise((resolve, reject) =>
		resolve({
			ok: true,
			status: response.status,
			statusText: response.statusText || "",
		})
	)
}
function isError({ status = 200 }, { ok = true, error = "", stack = "" }) {
	return ok !== true || error.length > 0 || status >= 400 || stack.length > 0
}

const ROOT_PATH = `${Conf.platform}/`

export function rawFetchFormDataPromise(url, method = "post", payload) {
	const fullPath = ROOT_PATH + url
	const opts = {
		body: getFormData(payload),
		headers: new Headers({
			"Content-type": "multipart/form-data",
		}),
		method,
	}

	return fetch(fullPath, opts)
}

export function rawFetchPromise(url, method = "GET", payload = null) {
	const fullPath = ROOT_PATH + url
	const opts = {
		headers: new Headers({
			"Content-Type": "application/json",
		}),
		method,
	}

	if (payload) {
		opts["body"] = JSON.stringify(payload)
	}

	return fetch(fullPath, opts)
}

export default store => next => action => {
	const returnValue = next(action)

	switch (action.type) {
		case TYPES.READ:
			action.id !== undefined ? readIdStart(store.dispatch, action) : readStart(store.dispatch, action)
			break
		case TYPES.CREATE:
			createStart(store.dispatch, action)
			break
		case TYPES.DELETE:
			delStart(store.dispatch, action)
			break
		case TYPES.UPDATE:
			updateStart(store.dispatch, action)
			break
		default:
			break
	}
	return returnValue
}

/**
 *
 * @param path   the path to read. path is the type of doc to read
 */
async function readStart(dispatch, action) {
	const response = await rawFetchPromise(action.path)

	checkResponse(response, action.path)
		.then(result => {
			isError(response, result)
				? dispatch(docActions.crudError(TYPES.READ_ERROR, action, { ...result, ...response }))
				: dispatch(docActions.readSuccess(action, result))
		})
		.catch(err => {
			dispatch(docActions.crudError(TYPES.READ_ERROR, action, err))
		})
}

/**
 * Read path/id ressource
 * @param dispatch
 * @param path    The ressource root path
 * @param id      The ressource id
 * @returns {Promise.<T>}
 */
async function readIdStart(dispatch, action) {
	const completePath = replace1(action.path, action.id)

	/*	const response = matchs([PATH_AVATAR], path)
		? await RNFetchBlob.fetch("GET", `${ROOT_PATH}${completePath}`)
		: await rawFetchPromise(completePath)
*/

	const response = await rawFetchPromise(completePath)

	checkResponse(response, action.path)
		.then(result => {
			isError(response, result)
				? dispatch(docActions.crudError(TYPES.READ_ERROR, action, { ...result, ...response }))
				: dispatch(docActions.readIdSuccess(action, result))
		})
		.catch(err => {
			dispatch(docActions.crudError(TYPES.READ_ERROR, action, err))
		})
}

async function createStart(dispatch, action) {
	// temp

	if (action.path === PATH_LOGOUT) {
		dispatch(docActions.createSuccess(action, { ...action.payload, code: 200, err: 0, error: 0 }))
		return
	}
	const response = action.form
		? await rawFetchFormDataPromise(action.path, "post", action.payload)
		: await rawFetchPromise(action.path, "post", action.payload)

	checkResponse(response, action.path)
		.then(result => {
			isError(response, result)
				? dispatch(docActions.crudError(TYPES.CREATE_ERROR, action, result, response))
				: dispatch(docActions.createSuccess(action, { ...action.payload, ...result }))
		})
		.catch(err => {
			dispatch(docActions.crudError(TYPES.CREATE_ERROR, action, err))
		})
}

async function updateStart(dispatch, action) {
	const response = await rawFetchPromise(`${action.path}/${action.id}`, "put", action.payload)

	checkResponse(response, action.path)
		.then(result => {
			isError(response, result)
				? dispatch(docActions.crudError(TYPES.UPDATE_ERROR, action, result, response))
				: dispatch(docActions.updateSuccess(action, { ...action.payload, ...result }))
		})
		.catch(err => {
			dispatch(docActions.crudError(TYPES.UPDATE_ERROR, action, err))
		})
}

async function delStart(dispatch, action) {
	const response = await rawFetchPromise(`${action.path}/${action.id}`, "delete", action.payload)

	checkResponse(response, action.path)
		.then(result => {
			isError(response, result)
				? dispatch(docActions.crudError(TYPES.CREATE_ERROR, action, result, response))
				: dispatch(docActions.delSuccess(action, result))
		})
		.catch(err => {
			dispatch(docActions.crudError(TYPES.DELETE_ERROR, action, err))
		})
}

const getFormData = data => {
	if (typeof data === "string") {
		return data
	}

	const formData = new FormData()

	for (const name in data) {
		if (name !== "formData") {
			const value = data[name]
			if (value instanceof Array) {
				value.map((val, i) => {
					formData.append(`${name}[]`, val)
				})
			} else {
				formData.append(name, value)
			}
		}
	}
	return formData
}

function FormDataToJSON(FormElement) {
	const formData = new FormData(FormElement),
		ConvertedJSON = {}
	for (const [key, value] of formData.entries()) {
		ConvertedJSON[key] = value
	}

	return ConvertedJSON
}
