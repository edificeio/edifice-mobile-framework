import moment from 'moment';

import {
  IBackendDistribution,
  IBackendForm,
  IBackendQuestion,
  IBackendQuestionChoice,
  IBackendQuestionResponse,
  IBackendResponseFile,
  IBackendSection,
} from './types';

import {
  DistributionStatus,
  IDistribution,
  IForm,
  IQuestion,
  IQuestionChoice,
  IQuestionResponse,
  IResponseFile,
  ISection,
} from '~/framework/modules/form/model';

export const distributionAdapter = (data: IBackendDistribution): IDistribution => {
  return {
    active: data.active,
    dateResponse: moment(data.date_response),
    dateSending: moment(data.date_sending),
    formId: data.form_id,
    id: data.id,
    originalId: data.original_id,
    responderId: data.responder_id,
    responderName: data.responder_name,
    senderId: data.sender_id,
    senderName: data.sender_name,
    status: data.status as DistributionStatus,
    structure: data.structure,
  };
};

export const formAdapter = (data: IBackendForm): IForm => {
  return {
    archived: data.archived,
    description: data.description,
    editable: data.editable,
    id: data.id,
    multiple: data.multiple,
    ownerName: data.owner_name,
    picture: data.picture,
    title: data.title,
  };
};

export const questionAdapter = (data: IBackendQuestion): IQuestion => {
  return {
    choices: [],
    conditional: data.conditional,
    cursorMaxLabel: data.cursor_max_label,
    cursorMaxVal: data.cursor_max_val,
    cursorMinLabel: data.cursor_min_label,
    cursorMinVal: data.cursor_min_val,
    cursorStep: data.cursor_step,
    formId: data.form_id,
    id: data.id,
    mandatory: data.mandatory,
    placeholder: data.placeholder,
    position: data.position,
    sectionId: data.section_id,
    statement: data.statement,
    title: data.title,
    type: data.question_type,
  };
};

export const compareSectionQuestions = (a: IBackendQuestion, b: IBackendQuestion): number => {
  if (!a.section_position || !b.section_position) return 0;
  return a.section_position - b.section_position;
};

export const compareMatrixChildren = (a: IBackendQuestion, b: IBackendQuestion): number => {
  if (!a.matrix_position || !b.matrix_position) return 0;
  return a.matrix_position - b.matrix_position;
};

export const questionChoiceAdapter = (data: IBackendQuestionChoice, platformUrl: string): IQuestionChoice => {
  return {
    id: data.id,
    image: data.image?.startsWith('/') ? platformUrl + data.image : data.image,
    isCustom: data.is_custom,
    isNextFormElementDefault: data.is_next_form_element_default,
    nextFormElementId: data.next_form_element_id,
    nextFormElementType: data.next_form_element_type,
    questionId: data.question_id,
    type: data.type,
    value: data.value,
  };
};

export const compareChoices = (a: IBackendQuestionChoice, b: IBackendQuestionChoice): number => {
  return a.position - b.position;
};

export const questionResponseAdapter = (data: IBackendQuestionResponse): IQuestionResponse => {
  return {
    answer: data.answer,
    choiceId: data.choice_id,
    choicePosition: data.choice_position,
    customAnswer: data.custom_answer,
    id: data.id,
    questionId: data.question_id,
  };
};

export const responseFileAdapter = (data: IBackendResponseFile): IResponseFile => {
  return {
    filename: data.filename,
    id: data.id,
    responseId: data.response_id,
    type: data.type,
  };
};

export const sectionAdapter = (data: IBackendSection): ISection => {
  return {
    description: data.description,
    formId: data.form_id,
    id: data.id,
    position: data.position,
    questions: [],
    title: data.title,
  };
};
