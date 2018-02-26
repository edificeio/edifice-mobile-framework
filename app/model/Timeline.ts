interface IParams {
	blogTitle: string
	username: string
}

export interface INewsModel {
	date: number
	id: string
	images: object[]
	message: string
	preview: string
	resourceName: string
	senderId: string
	senderName: string
}

export interface INewsState {
	didInvalidate: boolean
	endReached: boolean
	isFetching: boolean
	news: INewsModel[]
}

export const Timeline = (
	state: INewsState = {
		didInvalidate: false,
		endReached: false,
		isFetching: false,
		news: [],
	},
	action
) => {
	//	console.log(action)
	switch (action.type) {
		case "APPEND_TIMELINE":
			return {
				...state,
				didInvalidate: false,
				news: [...state.news, ...action.news],
				isFetching: false,
			}
		case "END_REACHED_TIMELINE":
			return {
				...state,
				didInvalidate: false,
				endReached: true,
				isFetching: false,
			}
		case "FETCH_TIMELINE":
			return {
				...state,
				isFetching: true,
			}
		case "CLEAR_TIMELINE":
			return {
				...state,
				endReached: false,
				isFetching: false,
				news: [],
			}
		default:
			return state
	}
}
