import { matchs, PATH_NEWS } from "../constants/paths"
import { crudReducer } from "./docs"

interface IParams {
	blogTitle: string
	username: string
}

export interface INewsModel {
	date: string
	_id: string
	params: IParams
	sender: string
}

const initialState: NewsState = {
	payload: [],
	synced: true,
}

export interface NewsState {
	payload: INewsModel[]
	synced: boolean
}

export function News(state: NewsState = initialState, action): NewsState {
	if (matchs([PATH_NEWS], action.path)) {
		return crudReducer(state, [PATH_NEWS], action, "results")
	}
	return state
}
