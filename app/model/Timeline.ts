import { AsyncStorage } from "react-native";

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
	didInvalidate: boolean;
	endReached: boolean;
	isFetching: boolean;
	news: INewsModel[];
	availableApps: any;
	selectedApps: any;
}

export const Timeline = (
	state: INewsState = {
		didInvalidate: false,
		endReached: false,
		isFetching: false,
		news: [],
		availableApps: undefined,
		selectedApps: undefined
	},
	action
) => {
	//	console.log(action)
	switch (action.type) {
		case 'PICK_FILTER_TIMELINE':
			return {
				...state,
				selectedApps: action.selectedApps
			}
		case 'FILTER_TIMELINE':
			return {
				...state,
				news: [],
				availableApps: action.availableApps
			}
		case "APPEND_TIMELINE":
			return {
				...state,
				news: [...state.news, ...action.news],
				isFetching: false
			}
		case "END_REACHED_TIMELINE":
			return {
				...state,
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
