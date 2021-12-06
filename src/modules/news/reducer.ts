/**
 * News Reducer
 */

import { Moment } from 'moment';

import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

// Types

export type RightOwner = { userId: string } | { groupId: string };

export interface INewsComment {
  _id: number;
  comment: string;
  owner: string;
  created: string;
  modified: string;
  username: string;
}

export interface INews {
  comments: INewsComment[];
  content: string;
  created: Moment;
  expiration_date: Moment | null;
  is_headline: boolean;
  modified: Moment | null;
  owner: string;
  publication_date: Moment | null;
  shared: (RightOwner & any)[];
  status: number;
  thread_icon: string;
  thread_id: number;
  thread_title: string;
  title: string;
  username: string;
  _id: number;
}

// State

export interface INews_State {}

// Reducer

const initialState: INews_State = {};

export default createSessionReducer(initialState, {
  // Add reducer functions here or use reducer tools
});

// Getters
