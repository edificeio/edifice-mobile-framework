/**
 * Form Reducer
 */
import { Moment } from 'moment';
import { combineReducers } from 'redux';

import { LocalFile } from '~/framework/util/fileHandler';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';
import moduleConfig from '~/modules/workspace/moduleConfig';

// Types

export enum DistributionStatus {
  FINISHED = 'FINISHED',
  ON_CHANGE = 'ON_CHANGE',
  TO_DO = 'TO_DO',
}

export enum QuestionType {
  FREETEXT = 1,
  SHORTANSWER = 2,
  LONGANSWER = 3,
  SINGLEANSWER = 4,
  MULTIPLEANSWER = 5,
  DATE = 6,
  TIME = 7,
  FILE = 8,
  SINGLEANSWERRADIO = 9,
  MATRIX = 10,
  SLIDER = 11,
  ORDER = 12,
}

export interface IDistribution {
  id: number;
  formId: number;
  senderId: string;
  senderName: string;
  responderId: string;
  responderName: string;
  status: DistributionStatus;
  dateSending: Moment;
  dateResponse?: Moment;
  active: boolean;
  structure?: string;
  originalId?: number;
}

export interface IForm {
  id: number;
  title: string;
  description: string;
  picture: string;
  ownerName: string;
  archived: boolean;
  multiple: boolean;
  editable: boolean;
}

export interface IQuestionChoice {
  id: number;
  questionId: number;
  value: string;
  type: string;
  nextSectionId: number | null;
  isCustom: boolean;
}

export interface IQuestionResponse {
  id?: number;
  questionId: number;
  answer: string;
  choiceId?: number;
  customAnswer?: string;
  files?: IResponseFile[];
  toDelete?: boolean;
}

export interface IQuestion {
  id: number;
  formId: number;
  title: string;
  position: number | null;
  type: QuestionType;
  statement?: string;
  mandatory: boolean;
  sectionId: number;
  conditional: boolean;
  placeholder?: string;
  cursorMinVal?: number;
  cursorMaxVal?: number;
  cursorStep?: number;
  cursorMinLabel?: string;
  cursorMaxLabel?: string;
  choices: IQuestionChoice[];
  children?: IQuestion[];
}

export interface IResponseFile {
  id: string | null;
  responseId: number;
  filename: string;
  type: string;
  lf?: LocalFile;
}

export interface ISection {
  id: number;
  formId: number;
  title: string;
  description: string;
  position: number;
  questions: IQuestion[];
}

export type IFormElement = IQuestion | ISection;

export interface IFormContent {
  elements: IFormElement[];
  elementsCount: number;
}

type IDistributionList = IDistribution[];
type IFormList = IForm[];

// State

interface IForm_StateData {
  distributions: IDistributionList;
  forms: IFormList;
  formContent: IFormContent;
}

export interface IForm_State {
  distributions: AsyncState<IDistributionList>;
  forms: AsyncState<IFormList>;
  formContent: AsyncState<IFormContent>;
}

// Reducer

const initialState: IForm_StateData = {
  distributions: [],
  forms: [],
  formContent: {
    elements: [],
    elementsCount: 0,
  },
};

export const actionTypes = {
  content: createAsyncActionTypes(moduleConfig.namespaceActionType('CONTENT')),
  listDistributionsReceived: createAsyncActionTypes(moduleConfig.namespaceActionType('LIST_DISTRIBUTIONS_RECEIVED')),
  listFormsReceived: createAsyncActionTypes(moduleConfig.namespaceActionType('LIST_FORMS_RECEIVED')),
};

export default combineReducers({
  distributions: createSessionAsyncReducer(initialState.distributions, actionTypes.listDistributionsReceived),
  forms: createSessionAsyncReducer(initialState.forms, actionTypes.listFormsReceived),
  formContent: createSessionAsyncReducer(initialState.formContent, actionTypes.content),
});

// Getters

export const getIsElementSection = (element: IFormElement) => {
  return !('type' in element);
};

export const formatElement = (element: IFormElement): IFormElement[] => {
  if (getIsElementSection(element)) {
    return [element, ...(element as ISection).questions];
  }
  return [element];
};

const getVisitedPositions = (elements: IFormElement[], responses: IQuestionResponse[]): number[] => {
  const visitedPositions: number[] = [];
  let nextSectionId;

  for (const element of elements) {
    if (nextSectionId !== undefined && element.id !== nextSectionId) continue;
    nextSectionId = undefined;
    visitedPositions.push(element.position!);
    const conditionalQuestion = (!('type' in element) ? element.questions : [element]).find(q => q.conditional);
    if (conditionalQuestion) {
      const choiceId = responses.find(r => r.questionId === conditionalQuestion.id)?.choiceId;
      nextSectionId = conditionalQuestion.choices.find(c => c.id === choiceId)?.nextSectionId;
    }
  }
  return visitedPositions;
};

const getIsQuestionAnswered = (question: IQuestion, responses: IQuestionResponse[]): boolean => {
  if (question.type === QuestionType.MATRIX) {
    const questionIds = question.children?.map(q => q.id);
    return responses.some(r => questionIds?.includes(r.questionId));
  }
  return responses.some(r => r.questionId === question.id);
};

export const formatSummary = (elements: IFormElement[], responses: IQuestionResponse[]): IFormElement[] => {
  const formatted: IFormElement[] = [];
  const visitedPositions = getVisitedPositions(elements, responses);

  elements = elements.filter(e => visitedPositions.includes(e.position!));
  for (const element of elements) {
    if (!('type' in element)) {
      const questions = element.questions.filter(q => getIsQuestionAnswered(q, responses));
      if (questions.length) {
        formatted.push(element);
      }
      formatted.push(...questions);
    } else if ('type' in element && getIsQuestionAnswered(element, responses)) {
      formatted.push(element);
    }
  }
  return formatted;
};

export const getIsMandatoryAnswerMissing = (elements: IFormElement[], responses: IQuestionResponse[]): boolean => {
  const questions = elements.filter(element => 'type' in element && element.mandatory) as IQuestion[];

  for (const question of questions) {
    const questionIds = question.type === QuestionType.MATRIX ? question.children!.map(q => q.id) : [question.id];
    for (const id of questionIds) {
      const questionResponses = responses.filter(r => r.questionId === id && !r.toDelete);
      if (!questionResponses.length || questionResponses.some(r => !r.answer)) return true;
    }
  }
  return false;
};

export const getPositionHistory = (elements: IFormElement[], responses: IQuestionResponse[]): number[] => {
  const history: number[] = [];
  const questionIds = responses.map(response => response.questionId);

  for (const element of elements) {
    const isSection = getIsElementSection(element);
    if (
      (isSection && (element as ISection).questions.some(q => questionIds.includes(q.id))) ||
      (!isSection && questionIds.includes(element.id))
    ) {
      history.push(element.position! - 1);
    }
  }
  return history
    .filter(function (elem, index, self) {
      return index === self.indexOf(elem);
    })
    .sort();
};
