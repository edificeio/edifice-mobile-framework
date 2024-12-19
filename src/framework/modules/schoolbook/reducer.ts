/**
 * Schoolbook Reducer
 */
import { Moment } from 'moment';

import moduleConfig from './module-config';

import { Reducers } from '~/app/store';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

// Types

export interface IChildWithUnacknowledgedWordsCount {
  id: string;
  name: string;
  unacknowledgedWordsCount: number;
}

export type IChildrenWithUnacknowledgedWordsCount = IChildWithUnacknowledgedWordsCount[];

export interface ITeacherWord {
  ackNumber: number;
  category: string;
  id: number;
  respNumber: number;
  sendingDate: Moment;
  title: string;
  total: number;
}

export type ITeacherWordList = ITeacherWord[];

export interface IStudentAndParentWord {
  acknowledgments: IAcknowledgment[];
  category: string;
  id: number;
  owner: string;
  ownerName: string;
  responses: IResponse[] | null;
  sendingDate: Moment;
  title: string;
}

export type IStudentAndParentWordList = IStudentAndParentWord[];

export interface IAcknowledgment {
  id: number;
  owner: string;
  parentName: string;
}

export interface IResponse {
  comment: string;
  id: number;
  modified: Moment;
  owner: string;
  parentName: string;
}

export interface IConcernedStudent {
  acknowledgments: IAcknowledgment[];
  owner: string;
  ownerName: string;
  responses: IResponse[] | null;
}

export interface IWord {
  category: string;
  id: number;
  ownerId: string;
  ownerName: string;
  reply: boolean;
  sendingDate: Moment;
  shared: ({ userId?: string; groupId?: string } & any)[] | [];
  text: string;
  title: string;
}

export interface IReportedWord extends IWord {
  ackNumber: number;
  respNumber: number;
  total: number;
}

export interface IWordReport {
  report: IConcernedStudent[];
  word: IReportedWord;
}

// Getters

export const getStudentsForTeacher = (recipients: IConcernedStudent[]) => {
  return recipients?.map(student => ({
    owner: student.owner,
    ownerName: student.ownerName,
  }));
};

export const getStudentsByAcknowledgementForTeacher = (recipients: IConcernedStudent[]) => {
  const acknowledgedStudents = recipients?.filter(student => student.acknowledgments);
  const unacknowledgedStudents = recipients?.filter(student => !student.acknowledgments);
  return {
    acknowledged: acknowledgedStudents,
    unacknowledged: unacknowledgedStudents,
  };
};

export const getIsWordAcknowledgedForTeacher = (ackNumber: number, total: number) => {
  return ackNumber === total;
};

export const getHasSingleRecipientForTeacher = (recipients: IConcernedStudent[]) => {
  return recipients?.length === 1;
};

export const getIsWordAcknowledgedForStudent = (acknowledgments: IAcknowledgment[]) => {
  return acknowledgments?.length > 0;
};

export const getReportByStudentForParent = (studentId: string, report: IConcernedStudent[]) => {
  return report?.find(concernedStudent => concernedStudent.owner === studentId);
};

export const getIsWordAcknowledgedForParent = (parentId: string, acknowledgments: IAcknowledgment[]) => {
  return acknowledgments?.some(acknowledgment => acknowledgment.owner === parentId);
};

export const getIsWordRepliedToForParent = (parentId: string, responses: IResponse[] | null) => {
  return responses?.some(response => response.owner === parentId);
};

// State

export interface ISchoolbookState {}

// Reducer

const initialState: ISchoolbookState = {};

const reducer = createSessionReducer(initialState, {
  // Add reducer functions here or use reducer tools
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
