/**
 * Schoolbook Reducer
 */
import { Moment } from 'moment';

import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

// Types

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

// State

export interface ISchoolbook_State {}

// Reducer

const initialState: ISchoolbook_State = {};

export default createSessionReducer(initialState, {
  // Add reducer functions here or use reducer tools
});

// Getters

export const getStudentsForTeacher = (recipients: IConcernedStudent[]) => {
  return recipients?.map(student => ({
    owner: student.owner,
    ownerName: student.ownerName,
  }));
};

export const getStudentsByAcknowledgementForTeacher = (recipients: IConcernedStudent[]) => {
  const acknowledgedStudents = recipients?.filter(student => student.acknowledgments?.length > 0);
  const unacknowledgedStudents = recipients?.filter(student => student.acknowledgments?.length === 0);
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

export const getAcknowledgementNamesForStudent = (studentId: string, wordReport: IWordReport) => {
  const concernedStudent = wordReport.report?.find(concernedStudent => concernedStudent.owner === studentId);
  return concernedStudent?.acknowledgments.map(acknowledgment => acknowledgment.parentName);
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

export const getResponsesForParent = (parentId: string, responses: IResponse[]) => {
  return responses?.filter(response => response.owner === parentId);
};

export const getResponseNumberForStudentAndParent = (responses: IResponse[] | null) => {
  return responses?.length;
};
