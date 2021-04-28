/**
 * Blog Reducer
 */

import { Moment } from "moment";
import { createSessionReducer } from "../../framework/redux/reducerFactory";

// Types

export interface IBlogPostWithComments extends IBlogPost { comments: IBlogPostComments }

export interface IBlogPostComment {
    author: {
      login: string;
      userId: string;
      username: string;
    }
    comment: string;
    created: Moment;
    id: string;
    state: string;
}

export type IBlogPostComments = IBlogPostComment[];

export interface IBlogPost {
    author: {
        login: string;
        userId: string;
        username: string;
    }
    content: string;
    created: Moment;
    firstPublishDate: Moment;
    modified: Moment;
    state: string;
    title: string;
    views: number;
    _id: string;
}

// State

export interface IBlog_State {};

// Reducer

const initialState: IBlog_State = {};

export default createSessionReducer(initialState, {
    // Add reducer functions here or use reducer tools
});

// Getters
