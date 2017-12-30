import FormData from "form-data"
import * as docActions from "../actions/docs"
import { Conf } from "../Conf"
import * as TYPES from "../constants/docs"
import { replace1 } from "../constants/paths"

function checkSystemError(response) {
	if (response.status >= 200 && response.status < 300) {
		return response
	} else {
		throw response
	}
}

function checkResponse(response) {
	checkSystemError(response)
	const contentType = response.headers.get("content-type")

	if (contentType && contentType.indexOf("application/json") !== -1) {
		return response.json()
	}
	return new Promise((resolve, reject) =>
		resolve({
			ok: response.ok,
			status: response.status,
			statusText: response.statusText,
		})
	)
}
function isError({ ok = true, code = 0, status = 200 }) {
	return (ok !== true && status !== 200) || code !== 0
}

const ROOT_PATH = `${Conf.platform}/`

function rawFetchFormDataPromise(url, method = "post", payload = "") {
	const fullPath = ROOT_PATH + url
	const opts = {
		method,
		headers: new Headers({
			"Content-type": "multipart/form-data",
		}),
		body: getFormData(payload),
	}

	return fetch(fullPath, opts)
}

function rawFetchPromise(url, method = "GET", payload = undefined) {
	const fullPath = ROOT_PATH + url
	const opts = {
		method,
		headers: new Headers({
			Accept: "application/json",
			"Content-Type": "application/json",
		}),
	}

	if (payload !== undefined) opts["body"] = JSON.stringify(payload)

	return fetch(fullPath, opts)
}

export default store => next => action => {
	const returnValue = next(action)

	switch (action.type) {
		case TYPES.READ:
			action.id >= 0 ? readIdStart(store.dispatch, action.path, action.id) : readStart(store.dispatch, action.path)
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
	const response = await rawFetchPromise(completePath)

	checkResponse(response)
		.then(result => {
			isError(result)
				? dispatch(docActions.crudError(TYPES.READ_ERROR, path, result))
				: dispatch(docActions.readIdSuccess(path, id, result))
		})
		.catch(err => {
			dispatch(docActions.crudError(TYPES.READ_ERROR, path, err))
		})
}

async function createStart(dispatch, path, doc) {
	const response = await rawFetchFormDataPromise(path, "post", doc)

	checkResponse(response)
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
	if (typeof data === "string") return data

	const formData = new FormData()

	for (const name in data) {
		if (name !== "formData") {
			const value = data[name]
			if (value instanceof Array) {
				value.map((val, i) => {
					formData.append(`${name}[]`, val)
				})
			} else formData.append(name, value)
		}
	}
	return formData
}

function FormDataToJSON(FormElement) {
	var formData = new FormData(FormElement),
		ConvertedJSON = {}
	for (const [key, value] of formData.entries()) {
		ConvertedJSON[key] = value
	}

	return ConvertedJSON
}
