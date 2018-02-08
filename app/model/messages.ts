export interface IMessagesProps {
	error: string
	message: string
	ok?: boolean
	stack: string
	status?: number
	statusText?: string
}

const initialState: IMessagesProps[] = [
	{
		error: "",
		message: "",
		ok: true,
		stack: "",
		status: 0,
		statusText: "",
	},
]

export function Messages(state = initialState, action) {
	if (action.type.indexOf("_REQUEST") > 0) {
		return state
	}
	if (action.payload === undefined) {
		return state
	}

	const { error = "" } = action.payload

	const { status = error.length > 0 ? 500 : 200, statusText = error } = action.payload

	if (action.type.indexOf("_SUCCESS") > 0) {
		if (statusText.length === 0) {
			return initialState
		}
		return [action.payload]
	}

	if (statusText.length === 0) {
		return state
	}

	let found = false
	const payload = { ...action.payload, status, statusText }

	// check if on the state there is already an error with same code. If yes, replace it
	let newState = state.map(doc => {
		if (doc.status && doc.status === action.payload.status) {
			found = true
			return payload
		}
		return doc
	})
	if (!found) {
		newState = [payload, ...state]
	}

	return newState
}
