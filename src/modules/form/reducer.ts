/**
 * Form Reducer
 */
import { Moment } from 'moment';
import { combineReducers } from 'redux';

import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';
import moduleConfig from '~/modules/workspace/moduleConfig';

// Types

export enum DistributionStatus {
  FINISHED = 'FINISHED',
  ONCHANGE = 'ON_CHANGE',
  TODO = 'TO_DO',
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
  SLIDER = 11,
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
  value?: string;
  type?: string;
  position?: number;
  nextSectionId?: number | null;
}

export interface IQuestionResponse {
  id?: number;
  questionId: number;
  answer: string;
  choiceId?: number;
}

export interface IQuestion {
  id: number;
  formId: number;
  title: string;
  position?: number;
  type: QuestionType;
  statement?: string;
  mandatory: boolean;
  sectionId: number;
  conditional: boolean;
  placeholder?: string;
  cursorMinVal?: number;
  cursorMaxVal?: number;
  cursorStep?: number;
  cursorLabelMinVal?: string;
  cursorLabelMaxVal?: string;
  choices: IQuestionChoice[];
}

export interface IResponseFile {
  id: string;
  responseId: number;
  filename: string;
  type: string;
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

export const formatSummary = (elements: IFormElement[], responses: IQuestionResponse[]): IFormElement[] => {
  const formatted: IFormElement[] = [];
  for (const element of elements) {
    const isSection = getIsElementSection(element);
    if (isSection) {
      const questions = (element as ISection).questions.filter(q => responses.some(r => r.questionId === q.id));
      if (questions.length) {
        formatted.push(element);
      }
      formatted.push(...questions);
    } else if (!isSection && responses.some(r => r.questionId === element.id)) {
      formatted.push(element);
    }
  }
  return formatted;
};

export const getIsMandatoryAnswerMissing = (elements: IFormElement[], responses: IQuestionResponse[]): boolean => {
  const questions = elements.filter(element => !getIsElementSection(element)) as IQuestion[];
  for (const question of questions) {
    if (question.mandatory) {
      const questionResponses = responses.filter(r => r.questionId === question.id);
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
