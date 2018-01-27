export interface IMessagesProps {
	ok?: boolean
	status?: number
	statusText?: string
}

const initialState: IMessagesProps[] = [
	{
		ok: true,
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

	const { statusText = "" } = action.payload

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

	// check if on the state there is already an error with same code. If yes, replace it
	let newState = state.map(doc => {
		if (doc.status && doc.status === action.payload.status) {
			found = true
			return action.payload
		}
		return doc
	})
	if (!found) {
		newState = [action.payload, ...state]
	}

	return newState
}
