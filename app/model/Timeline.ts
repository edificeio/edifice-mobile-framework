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
	endReached: boolean;
	isFetching: boolean;
	news: INewsModel[];
	availableApps: any;
	selectedApps: any;
	refresh: boolean;
	fetchFailed: boolean;
}

export const Timeline = (
	state: INewsState = {
		endReached: false,
		isFetching: false,
		news: [],
		availableApps: undefined,
		selectedApps: undefined,
		refresh: true,
		fetchFailed: false
	},
	action
) => {
	//	console.log(action)
	switch (action.type) {
		case 'INVALIDATE_TIMELINE':
			return {
				...state,
				refresh: true,
				endReached: false,
				isFetching: false,
				news: []
			}
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
				news: [...state.news, ...action.news.filter(n => state.news.find(n2 => n2.id === n.id) === undefined)],
				isFetching: false
			}
		case "FETCH_NEW_TIMELINE":
			return {
				...state,
				news: [...action.news.filter(e => state.news.find(n => n.id === e.id) === undefined), ...state.news],
				isFetching: false
			}
		case "END_REACHED_TIMELINE":
			return {
				...state,
				news: [...state.news],
				endReached: true,
				isFetching: false
			}
		case "FETCH_TIMELINE":
			return {
				...state,
				isFetching: true,
				refresh: false,
				endReached: false,
				fetchFailed: false
			}
		case "FAILED_LOAD_TIMELINE":
			return {
				...state,
				isFetching: false,
				endReached: true,
				fetchFailed: true
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
