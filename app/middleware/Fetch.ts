import FormData from "form-data"
import RNFetchBlob from "react-native-fetch-blob"
import * as docActions from "../actions/docs"
import { Conf } from "../Conf"
import * as TYPES from "../constants/docs"
import { matchs, PATH_AVATAR, PATH_CONVERSATION, PATH_LOGIN, PATH_LOGOUT, replace1 } from "../constants/paths"
import { tr } from "../i18n/t"

function getXsrf(cookies) {
	const cookiesSplit = cookies.split(";")
	for (let i = 0; i < cookiesSplit.length; i++) {
		const cookie = {
			name: cookiesSplit[i].split("=")[0].trim(),
			value: cookiesSplit[i].split("=")[1].trim(),
		}
		if (cookie.name === "XSRF-TOKEN") {
			return cookie.value
		}
	}
	return ""
}

function checkResponse(response, path = null) {
	if (response.headers === undefined) {
		return new Promise((resolve, reject) => resolve(response.base64()))
	}

	if (path === PATH_LOGIN) {
		const cookies = response.headers.get("Set-Cookie")

		if (cookies === null) {
			return new Promise((resolve, reject) =>
				reject({
					loggedIn: false,
					ok: false,
					status: tr.Identifiant_incorrect,
					statusText: tr.Identifiant_incorrect,
				})
			)
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
			statusText: response.statusText,
		})
	)
}
function isError({ ok = true, status = 200 }) {
	return ok !== true || status >= 400
}

const ROOT_PATH = `${Conf.platform}/`
const FAKE_ROOT_PATH = "http://192.168.0.24:3000/"

function rawFetchFormDataPromise(url, method = "post", payload = "") {
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

function rawFetchPromise(url, method = "GET", payload = null) {
	const fullPath = (url === PATH_CONVERSATION ? FAKE_ROOT_PATH : ROOT_PATH) + url
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
			action.id !== undefined
				? readIdStart(store.dispatch, action.path, action.id)
				: readStart(store.dispatch, action.path)
			break
		case TYPES.CREATE:
			createStart(store.dispatch, action.path, action.payload)
			break
		case TYPES.DELETE:
			delStart(store.dispatch, action)
			break
		case TYPES.UPDATE:
			updateStart(store.dispatch, action.path, action.payload)
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
async function readStart(dispatch, path) {
	const response = await rawFetchPromise(path)

	checkResponse(response)
		.then(result => {
			isError(result)
				? dispatch(docActions.crudError(TYPES.READ_ERROR, path, result))
				: dispatch(docActions.readSuccess(path, result))
		})
		.catch(err => {
			dispatch(docActions.crudError(TYPES.READ_ERROR, path, err))
		})
}

/**
 * Read path/id ressource
 * @param dispatch
 * @param path    The ressource root path
 * @param id      The ressource id
 * @returns {Promise.<T>}
 */
async function readIdStart(dispatch, path, id) {
	const completePath = replace1(path, id)

	const response = matchs([PATH_AVATAR], path)
		? await RNFetchBlob.fetch("GET", `${ROOT_PATH}${completePath}`)
		: await rawFetchPromise(completePath)

	checkResponse(response)
		.then(result => {
			isError(result)
				? dispatch(docActions.crudError(TYPES.READ_ERROR, path, result))
				: dispatch(docActions.readIdSuccess(completePath, id, result))
		})
		.catch(err => {
			dispatch(docActions.crudError(TYPES.READ_ERROR, path, err))
		})
}

async function createStart(dispatch, path, doc) {
	// temp

	if (path === PATH_LOGOUT) {
		dispatch(docActions.createSuccess(path, { ...doc, code: 200, err: 0, error: 0 }))
		return
	}
	const response = await rawFetchFormDataPromise(path, "post", doc)

	checkResponse(response, path)
		.then(result => {
			isError(result)
				? dispatch(docActions.crudError(TYPES.CREATE_ERROR, path, result))
				: dispatch(docActions.createSuccess(path, { ...doc, ...result }))
		})
		.catch(err => {
			dispatch(docActions.crudError(TYPES.CREATE_ERROR, path, err))
		})
}

async function updateStart(dispatch, path, aDoc) {
	const response = await rawFetchPromise(`${aDoc.path}/${aDoc.id}`, "put", aDoc)

	checkResponse(response)
		.then(result => {
			isError(result)
				? dispatch(docActions.crudError(TYPES.UPDATE_ERROR, aDoc.path, result))
				: dispatch(docActions.updateSuccess(aDoc.path, { ...aDoc, ...result }))
		})
		.catch(err => {
			dispatch(docActions.crudError(TYPES.UPDATE_ERROR, aDoc.path, err))
		})
}

async function delStart(dispatch, aDoc) {
	const response = await rawFetchPromise(`${aDoc.path}/${aDoc.id}`, "delete", aDoc)

	checkResponse(response)
		.then(result => {
			isError(result)
				? dispatch(docActions.crudError(TYPES.CREATE_ERROR, aDoc.path, result))
				: dispatch(docActions.delSuccess(aDoc.path, result))
		})
		.catch(err => {
			dispatch(docActions.crudError(TYPES.DELETE_ERROR, aDoc.path, err))
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
