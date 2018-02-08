import { PATH_USER } from "../constants/paths"
import { IThreadState } from "./Thread"
import { crudReducer } from "./docs"

export interface IUserModel {
	name: string
}

export interface IUserState {
	payload: IUserModel[]
	synced: boolean
}

const initialState: IUserState = {
	payload: [],
	synced: true,
}

export default (state: IUserState = initialState, action): IThreadState => {
	return crudReducer(state, [PATH_USER], action)
}
