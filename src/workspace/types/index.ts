import rootReducer from "../reducers";
import { NavigationScreenProp } from "react-navigation";

export * from "./documents"
export * from "./folders"

export interface IFolder {
  id: string;
  name: string;
}

export interface IFile {
  id: string;
  name: string;
}

export interface IState {
  directories: IFolder[];
  files: IFile[];
}

export interface IDataProps extends IState {
}

export interface IActionProps {
  fetchWorkspaceList: any;
}

export interface IEventProps {
    dispatch: any
    fetchWorkspaceList: any
}

export interface IOtherProps {
  navigation?: NavigationScreenProp<{}>;
}

export type IProps = IDataProps & IEventProps & IOtherProps;

export type Reducer = ReturnType<typeof rootReducer>;