import { ImageURISource } from "react-native";
import { AnyAction } from "redux";
import { IPublishableBlogsState } from "./state/publishableBlogs";
import { IBlogCommentListState } from "./state/commentList";
import * as reducerActions from "./reducerActions";
import publishableBlogsReducer, { publishStatusReducer } from "./reducers/publishableBlogs";
import blogCommentsReducer from "./reducers/blogCommentList";
import { createEndSessionActionType } from "../infra/redux/reducerFactory";

export interface IMediaModel {
  type: "image" | "video" | "audio" | "iframe";
  src: string | { src: ImageURISource; alt: string;};
}

export interface INewsModel {
  date: number;
  eventType: string;
  id: string;
  media: IMediaModel[];
  message: string;
  preview: string;
  resourceName: string;
  senderId: string;
  senderName: string;
  type: string;
}

export interface INewsState {
  endReached: boolean;
  isFetching: boolean;
  news: INewsModel[];
  availableApps: any;
  selectedApps: any;
  refresh: boolean;
  fetchFailed: boolean;
  selectedBlogComments: IBlogCommentListState;
  publishableBlogs: IPublishableBlogsState;
  publishStatus: { publishing: boolean }
}

const initialState: INewsState = {
  endReached: false,
  isFetching: false,
  news: [],
  availableApps: undefined,
  selectedApps: undefined,
  refresh: true,
  fetchFailed: false,
  publishableBlogs: {
    data: [],
    isPristine: true,
    isFetching: false,
    error: undefined
  },
  publishStatus: {
    publishing: false
  }
};

export default (
  state = initialState,
  action: AnyAction
) => {
  for (let actionType in reducerActions) {
    if (action.type === actionType) {
      return reducerActions[actionType](state, action);
    }
  }

  // Session flush forward-compatibility.
  if (action.type == createEndSessionActionType()) {
    return initialState;
  }

  return {
    ...state,
    selectedBlogComments: blogCommentsReducer(state.selectedBlogComments, action),
    publishableBlogs: publishableBlogsReducer(state.publishableBlogs, action),
    publishStatus: publishStatusReducer(state.publishStatus, action)
  };
};
