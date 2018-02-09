interface IParams {
	blogTitle: string
	username: string
}

export interface INewsModel {
	preview: string
	senderId: string
	senderName: string
	resourceName: string
	message: string
	images: string[]
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
	console.log(action)
	switch (action.type) {
		case "APPEND":
			return {
				...state,
				didInvalidate: false,
				news: state.news.concat(action.news),
				isFetching: false,
			}
		case "END_REACHED":
			return {
				...state,
				didInvalidate: false,
				endReached: true,
				isFetching: false,
			}
		case "FETCH":
			return {
				...state,
				isFetching: true,
			}
		case "RESET":
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
