import rootReducer from "../reducers";
import { NavigationScreenProp } from "react-navigation";

export enum Filters {
  owner = "owner",
  shared = "shared",
  protected = "protected",
  trash = "trash"
}

export interface IFiltersParameters {
  filter?: Filters;
  parentId?: string;
};

export type IRight = {
  owner: Filters;
  ownerName: string;
}

export type IEntity = IRight & {
  date: number,
  id: string,
  name: string,
  number: number
  isFolder: boolean
}

export interface IEntityArray {
  [key: string]: IEntity;
}

export interface IStateWorkspace {
  [key: string]: IEntityArray;
}

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