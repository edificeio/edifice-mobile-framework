/**
 * Blog Reducer
 */

import { Moment } from "moment";
import { createSessionReducer } from "../../framework/util/redux/reducerFactory";
import { resourceRightFilter } from "../../framework/util/resourceRights";
import { IUserSession } from "../../framework/util/session";
import { createBlogPostResourceRight } from "./rights";

// Types

export interface IBlogPostWithComments extends IBlogPost { comments: IBlogPostComments }

export interface IBlog {
    id: string;
    visibility: string;
    title: string;
    thumbnail?: string;
    trashed?: boolean;
    'comment-type': string;
    'publish-type': string;
    description?: string;
    created: Moment;
    modified: Moment;
    author: { userId: string; username: string; login: string; }
    shared?: Array<{
        [key: string]: boolean | string | undefined,
    } & {
            [key in 'userId' | 'groupId']: string
        }>;
}
export type IBlogList = IBlog[];

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

export interface IBlog_State { };

// Reducer

const initialState: IBlog_State = {};

export default createSessionReducer(initialState, {
    // Add reducer functions here or use reducer tools
});

// Getters

export const getPublishableBlogs = (session: IUserSession, blogs: IBlogList) => {
    const publishableBlogs = (resourceRightFilter(
        blogs,
        createBlogPostResourceRight,
        session) as IBlogList)
        .filter((blog: IBlog) => !blog.trashed);
    return publishableBlogs;
}
