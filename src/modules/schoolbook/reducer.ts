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
  text: string;
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
  text: string;
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
  sendingDate: Moment;
  text: string;
  title: string;
}

export interface IReportedWord extends IWord {
  ackNumber: number;
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

export const getStudentsForTeacher = (wordReport: IWordReport) => {
  return wordReport.report?.map(student => ({
    owner: student.owner,
    ownerName: student.ownerName,
  }));
};

export const getStudentsByAcknowledgementForTeacher = (wordReport: IWordReport) => {
  const acknowledgedStudents = wordReport.report?.filter(student => student.acknowledgments?.length > 0);
  const unacknowledgedStudents = wordReport.report?.filter(student => student.acknowledgments?.length === 0);
  return {
    acknowledged: acknowledgedStudents,
    unacknowledged: unacknowledgedStudents,
  };
};

export const getAcknowledgementNamesForStudent = (studentId: string, wordReport: IWordReport) => {
  const concernedStudent = wordReport.report?.find(concernedStudent => concernedStudent.owner === studentId);
  return concernedStudent?.acknowledgments.map(acknowledgment => acknowledgment.parentName);
};

export const getIsWordAcknowledgedForStudent = (acknowledgments: IAcknowledgment[]) => {
  return acknowledgments?.length > 0;
};

export const getUnacknowledgedStudentIdsForParent = (parentId: string, wordReport: IWordReport) => {
  const acknowledgedStudents: string[] = [];
  for (const concernedStudent of wordReport.report) {
    concernedStudent.acknowledgments?.forEach(acknowledgment => {
      if (parentId === acknowledgment.owner) acknowledgedStudents.push(concernedStudent.owner);
    });
  }
  const unacknowledgedStudents = wordReport.report?.filter(
    concernedStudent => !acknowledgedStudents.includes(concernedStudent.owner),
  );
  const unacknowledgedStudentsIds = unacknowledgedStudents?.map(unacknowledgedStudent => unacknowledgedStudent.owner);
  return unacknowledgedStudentsIds;
};

export const getIsWordAcknowledgedForParent = (parentId: string, acknowledgments: IAcknowledgment[]) => {
  return acknowledgments?.find(acknowledgment => acknowledgment.owner === parentId);
};

export const getResponsesForParent = (parentId: string, responses: IResponse[]) => {
  return responses?.filter(response => response.owner === parentId);
};

export const getResponseNumberForStudentAndParent = (studentAndParentWord: IStudentAndParentWord) => {
  return studentAndParentWord.responses?.length;
};
