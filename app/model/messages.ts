const initialState: Array<MessagesProps> = [
	{
		code: 0,
		message: "",
		result: 0,
	},
]

export interface MessagesProps {
	code?: number
	message?: string
	result?: number
}

export function Messages(state = initialState, action) {
	if (action.type.indexOf("_REQUEST") > 0) return state
	if (action.payload === undefined) return state

	const { message = "" } = action.payload

	if (message.length === 0) return state

	const { code = 0, result = 0 } = action.payload

	if (action.type.indexOf("_SUCCESS") > 0) return [initialState]

	let found = false

	const newError = { code, message, result }

	if (action.type.indexOf("_SUCCESS") > 0) return [newError]

	// check if on the state there is already an error with same code. If yes, replace it
	let newState = state.map(doc => {
		if (doc.code && doc.code === newError.code) {
			found = true
			return newError
		}
		return doc
	})
	if (!found) newState = [newError, ...state]

	return newState
}
