import rootReducer from "../reducers";
import { NavigationScreenProp } from "react-navigation";
import {IArrayById} from "../../infra/collections";

export enum FiltersEnum {
  owner = "owner",
  shared = "shared",
  protected = "protected",
  trash = "trash",
}

export type IFiltersParameters = {
  filter?: FiltersEnum;
  parentId?: string;
};

export type IRight = {
  owner: FiltersEnum;
  ownerName: string;
}

export type IEntity = IRight & {
  date: number,
  id: string,
  name: string,
  number: number
  isFolder: boolean
}

export type IEntityArray = IArrayById<IEntity>;

export interface IStateView {
  id: string,
  filesFolders: IEntityArray;
}

export type IStateWorkspace = IArrayById<IStateView>;

export interface IActionProps {
  fetchWorkspaceList: (params: IFiltersParameters) => void
}

export interface IEventProps {
  onPress: (id: string) => void
}

export interface INavigationProps {
  navigation: NavigationScreenProp<{}>;
}

export interface IDataProps {
  filesFolders: IEntityArray;
  isFetching: boolean
}

export type IProps = IActionProps & IEventProps & INavigationProps & IDataProps

export type Reducer = ReturnType<typeof rootReducer>;