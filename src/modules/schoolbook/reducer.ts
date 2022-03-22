/**
 * Schoolbook Reducer
 */

import { Moment } from 'moment';

import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

// Types

export interface ISchoolbookWordResponse {
  id: number;
  owner: string;
  parentName: string;
  comment: string;
  modified: Moment;
}

export interface ISchoolbookWordAcknowledgment {
  id: number;
  owner: string;
  parent_name: string;
}

export interface ISchoolbookWordConcernedChild {
  owner: string;
  owner_name: string;
  responses: ISchoolbookWordResponse[] | null;
  acknowledgments: ISchoolbookWordAcknowledgment[];
}

export interface ISchoolbookWord {
  id: number;
  title: string;
  text: string;
  sending_date: Moment;
  reply: boolean;
  category: string;
  owner_id: string;
  owner_name: string;
  shared: ({ userId?: string; groupId?: string } & any)[] | [];
}

export interface IReportedSchoolbookWord extends ISchoolbookWord {
  total: number;
  resp_number: number;
  ack_number: number;
}

export interface ISchoolbookWordReport {
  word: IReportedSchoolbookWord;
  report: ISchoolbookWordConcernedChild[];
}

// State

export interface ISchoolbook_State {}

// Reducer

const initialState: ISchoolbook_State = {};

export default createSessionReducer(initialState, {
  // Add reducer functions here or use reducer tools
});

// Getters

export const getUnacknowledgedChildrenIdsForParent = (parentId: string, wordReport: ISchoolbookWordReport) => {
  const acknowledgedChildren: string[] = [];
  for (const concernedChild of wordReport.report) {
    concernedChild.acknowledgments?.forEach(ack => {
      if (parentId === ack.owner) acknowledgedChildren.push(concernedChild.owner);
    });
  }
  const unacknowledgedChildren = wordReport.report.filter(concernedChild => !acknowledgedChildren.includes(concernedChild.owner));
  const unacknowledgedChildrenIds = unacknowledgedChildren.map(unacknowledgedChild => unacknowledgedChild.owner);
  return unacknowledgedChildrenIds;
};

export const getIsWordAcknowledgedForParent = (parentId: string, wordReport: ISchoolbookWordReport) => {
  return getUnacknowledgedChildrenIdsForParent(parentId, wordReport).length === 0;
};

export const getAcknowledgeNamesForChild = (childId: string, wordReport: ISchoolbookWordReport) => {
  const concernedChild = wordReport.report.find(concernedChild => concernedChild.owner === childId);
  if (!concernedChild) return undefined;
  return concernedChild.acknowledgments ? concernedChild.acknowledgments.map(ack => ack.parent_name) : [];
};

export const getAcknowledgeNumber = (wordReport: ISchoolbookWordReport) => {
  return wordReport.word.ack_number || 0;
};
