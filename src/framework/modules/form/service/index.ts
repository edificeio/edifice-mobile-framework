import moment from 'moment';

import { ISession } from '~/framework/modules/auth/model';
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
import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';
import fileHandlerService from '~/framework/util/fileHandler/service';
import { fetchJSONWithCache, fetchWithCache, signedFetchJson } from '~/infra/fetchWithCache';

interface IBackendDistribution {
  id: number;
  form_id: number;
  sender_id: string;
  sender_name: string;
  responder_id: string;
  responder_name: string;
  status: string;
  date_sending: string;
  date_response?: string;
  active: boolean;
  structure?: string;
  original_id?: number;
}

interface IBackendForm {
  id: number;
  title: string;
  description: string;
  picture: string;
  owner_id: string;
  owner_name: string;
  date_creation: string;
  date_modification: string;
  sent: boolean;
  collab: boolean;
  archived: boolean;
  date_opening: string;
  date_ending?: string;
  multiple: boolean;
  anonymous: boolean;
  reminded: boolean;
  response_notified: boolean;
  editable: boolean;
  rgpd: boolean;
  rgpd_goal: string;
  rgpd_lifetime: number;
  is_public: boolean;
  public_key?: number;
}

interface IBackendQuestion {
  id: number;
  form_id: number;
  title: string;
  position: number | null;
  question_type: number;
  statement: string;
  mandatory: boolean;
  original_question_id: number;
  section_id: number;
  section_position: number | null;
  conditional: boolean;
  placeholder?: string;
  matrix_id?: number;
  matrix_position?: number;
  cursor_min_val?: number;
  cursor_max_val?: number;
  cursor_step?: number;
  cursor_min_label?: string;
  cursor_max_label?: string;
}

interface IBackendQuestionChoice {
  id: number;
  question_id: number;
  value: string;
  type: string;
  position: number;
  next_form_element_id: number | null;
  is_custom: boolean;
  next_form_element_type: 'QUESTION' | 'SECTION' | null;
  is_next_form_element_default: boolean;
  image: string | null;
}

interface IBackendQuestionResponse {
  id: number;
  question_id: number;
  answer: string;
  responder_id: string;
  choice_id?: number;
  distribution_id: number;
  original_id?: number;
  choice_position?: number;
  custom_answer: string;
}

interface IBackendResponseFile {
  id: string;
  response_id: number;
  filename: string;
  type: string;
}

interface IBackendSection {
  id: number;
  form_id: number;
  title: string;
  description: string;
  position: number;
  original_section_id?: number;
}

type IBackendDistributionList = IBackendDistribution[];
type IBackendFormList = IBackendForm[];
type IBackendQuestionList = IBackendQuestion[];
type IBackendQuestionChoiceList = IBackendQuestionChoice[];
type IBackendQuestionResponseList = IBackendQuestionResponse[];
type IBackendResponseFileList = IBackendResponseFile[];
type IBackendSectionList = IBackendSection[];

const distributionAdapter = (data: IBackendDistribution): IDistribution => {
  return {
    id: data.id,
    formId: data.form_id,
    senderId: data.sender_id,
    senderName: data.sender_name,
    responderId: data.responder_id,
    responderName: data.responder_name,
    status: data.status as DistributionStatus,
    dateSending: moment(data.date_sending),
    dateResponse: moment(data.date_response),
    active: data.active,
    structure: data.structure,
    originalId: data.original_id,
  };
};

const formAdapter = (data: IBackendForm): IForm => {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    picture: data.picture,
    ownerName: data.owner_name,
    archived: data.archived,
    multiple: data.multiple,
    editable: data.editable,
  };
};

const questionAdapter = (data: IBackendQuestion): IQuestion => {
  return {
    id: data.id,
    formId: data.form_id,
    title: data.title,
    position: data.position,
    type: data.question_type,
    statement: data.statement,
    mandatory: data.mandatory,
    sectionId: data.section_id,
    conditional: data.conditional,
    placeholder: data.placeholder,
    cursorMinVal: data.cursor_min_val,
    cursorMaxVal: data.cursor_max_val,
    cursorStep: data.cursor_step,
    cursorMinLabel: data.cursor_min_label,
    cursorMaxLabel: data.cursor_max_label,
    choices: [],
  };
};

const compareSectionQuestions = (a: IBackendQuestion, b: IBackendQuestion): number => {
  if (!a.section_position || !b.section_position) return 0;
  return a.section_position - b.section_position;
};

const compareMatrixChildren = (a: IBackendQuestion, b: IBackendQuestion): number => {
  if (!a.matrix_position || !b.matrix_position) return 0;
  return a.matrix_position - b.matrix_position;
};

const questionChoiceAdapter = (data: IBackendQuestionChoice, platformUrl: string): IQuestionChoice => {
  return {
    id: data.id,
    questionId: data.question_id,
    value: data.value,
    type: data.type,
    nextFormElementId: data.next_form_element_id,
    nextFormElementType: data.next_form_element_type,
    isNextFormElementDefault: data.is_next_form_element_default,
    isCustom: data.is_custom,
    image: data.image?.startsWith('/') ? platformUrl + data.image : data.image,
  };
};

const compareChoices = (a: IBackendQuestionChoice, b: IBackendQuestionChoice): number => {
  return a.position - b.position;
};

const questionResponseAdapter = (data: IBackendQuestionResponse): IQuestionResponse => {
  return {
    id: data.id,
    questionId: data.question_id,
    answer: data.answer,
    choiceId: data.choice_id,
    customAnswer: data.custom_answer,
    choicePosition: data.choice_position,
  };
};

const responseFileAdapter = (data: IBackendResponseFile): IResponseFile => {
  return {
    id: data.id,
    responseId: data.response_id,
    filename: data.filename,
    type: data.type,
  };
};

const sectionAdapter = (data: IBackendSection): ISection => {
  return {
    id: data.id,
    formId: data.form_id,
    title: data.title,
    description: data.description,
    position: data.position,
    questions: [],
  };
};

export const formService = {
  distributions: {
    list: async (session: ISession) => {
      const api = '/formulaire/distributions/listMine';
      const distributions = (await fetchJSONWithCache(api)) as IBackendDistributionList;
      return distributions.map(distributionAdapter);
    },
    listFromForm: async (session: ISession, formId: number) => {
      const api = `/formulaire/distributions/forms/${formId}/listMine`;
      const distributions = (await fetchJSONWithCache(api)) as IBackendDistributionList;
      return distributions.map(distributionAdapter);
    },
  },
  distribution: {
    get: async (session: ISession, distributionId: number) => {
      const api = `/formulaire/distributions/${distributionId}`;
      const distribution = (await fetchJSONWithCache(api)) as IBackendDistribution;
      return distributionAdapter(distribution);
    },
    add: async (session: ISession, distributionId: number) => {
      const api = `/formulaire/distributions/${distributionId}/add`;
      const distribution = (await signedFetchJson(`${session.platform.url}${api}`, {
        method: 'POST',
      })) as IBackendDistribution;
      return distributionAdapter(distribution);
    },
    getResponses: async (session: ISession, distributionId: number) => {
      const api = `/formulaire/distributions/${distributionId}/responses`;
      const responses = (await fetchJSONWithCache(api)) as IBackendQuestionResponseList;
      return responses.map(questionResponseAdapter);
    },
    deleteQuestionResponses: async (session: ISession, distributionId: number, questionId: number) => {
      const api = `/formulaire/responses/${distributionId}/questions/${questionId}`;
      return signedFetchJson(`${session.platform.url}${api}`, {
        method: 'DELETE',
      }) as Promise<[]>;
    },
    put: async (session: ISession, distribution: IDistribution) => {
      const api = `/formulaire/distributions/${distribution.id}`;
      const body = JSON.stringify(distribution);
      const distrib = (await signedFetchJson(`${session.platform.url}${api}`, {
        method: 'PUT',
        body,
      })) as IBackendDistribution;
      return distributionAdapter(distrib);
    },
    duplicate: async (session: ISession, distributionId: number) => {
      const api = `/formulaire/distributions/${distributionId}/duplicate`;
      const distribution = (await signedFetchJson(`${session.platform.url}${api}`, {
        method: 'POST',
      })) as IBackendDistribution;
      return distributionAdapter(distribution);
    },
    replace: async (session: ISession, distributionId: number, originalDistributionId: number) => {
      const api = `/formulaire/distributions/${distributionId}/replace/${originalDistributionId}`;
      const distribution = (await signedFetchJson(`${session.platform.url}${api}`, {
        method: 'DELETE',
      })) as IBackendDistribution;
      return distributionAdapter(distribution);
    },
  },
  forms: {
    getReceived: async (session: ISession) => {
      const api = '/formulaire/forms/sent';
      const forms = (await fetchJSONWithCache(api)) as IBackendFormList;
      return forms.map(formAdapter);
    },
  },
  form: {
    get: async (session: ISession, id: number) => {
      const api = `/formulaire/forms/${id}`;
      const form = (await fetchJSONWithCache(api)) as IBackendForm;
      return formAdapter(form);
    },
    getElementsCount: async (session: ISession, formId: number) => {
      const api = `/formulaire/forms/${formId}/elements/count`;
      const data = (await fetchJSONWithCache(api)) as { count: number };
      return data.count;
    },
    getQuestions: async (session: ISession, formId: number) => {
      const api = `/formulaire/forms/${formId}/questions`;
      const questions = (await fetchJSONWithCache(api)) as IBackendQuestionList;
      return questions.map(questionAdapter);
    },
    getSections: async (session: ISession, formId: number) => {
      const api = `/formulaire/forms/${formId}/sections`;
      const sections = (await fetchJSONWithCache(api)) as IBackendSectionList;
      return sections.map(sectionAdapter);
    },
    hasResponderRight: async (session: ISession, formId: number) => {
      const api = `/formulaire/forms/${formId}/rights`;
      const rights = (await fetchJSONWithCache(api)) as { action: string }[];
      return rights.some(r => r.action === 'fr-openent-formulaire-controllers-FormController|initResponderResourceRight');
    },
  },
  questions: {
    getAllChoices: async (session: ISession, questionIds: number[]) => {
      let api = `/formulaire/questions/choices/all?`;
      questionIds.forEach((value, index) => (api += `${index}=${value}&`));
      const headers = {
        Accept: 'application/json;version=1.9',
      };
      const choices = (await fetchJSONWithCache(api, { headers })) as IBackendQuestionChoiceList;
      choices.sort(compareChoices);
      return choices.map(choice => questionChoiceAdapter(choice, session.platform.url));
    },
    getChildren: async (session: ISession, questionIds: number[]) => {
      let api = `/formulaire/questions/children?`;
      questionIds.forEach((value, index) => (api += `${index}=${value}&`));
      const children = (await fetchJSONWithCache(api)) as IBackendQuestionList;
      children.sort(compareMatrixChildren);
      return children.map(questionAdapter);
    },
  },
  question: {
    createResponse: async (
      session: ISession,
      questionId: number,
      distributionId: number,
      choiceId: number | null,
      answer: string,
      customAnswer: string | null,
      choicePosition: number | null,
    ) => {
      const api = `/formulaire/questions/${questionId}/responses`;
      const body = JSON.stringify({
        question_id: questionId,
        distribution_id: distributionId,
        choice_id: choiceId,
        answer,
        responder_id: session.user.id,
        custom_answer: customAnswer,
        choice_position: choicePosition,
      });
      const response = (await signedFetchJson(`${session.platform.url}${api}`, {
        method: 'POST',
        body,
      })) as IBackendQuestionResponse;
      return questionResponseAdapter(response);
    },
    getChoices: async (session: ISession, questionId: number) => {
      const api = `/formulaire/questions/${questionId}/choices`;
      const headers = {
        Accept: 'application/json;version=1.9',
      };
      const choices = (await fetchJSONWithCache(api, { headers })) as IBackendQuestionChoiceList;
      choices.sort(compareChoices);
      return choices.map(choice => questionChoiceAdapter(choice, session.platform.url));
    },
    getDistributionResponses: async (session: ISession, questionId: number, distributionId: number) => {
      const api = `/formulaire/questions/${questionId}/distributions/${distributionId}/responses`;
      const responses = (await fetchJSONWithCache(api)) as IBackendQuestionResponseList;
      return responses.map(questionResponseAdapter);
    },
  },
  responses: {
    delete: async (session: ISession, formId: number, responses: IQuestionResponse[]) => {
      const api = `/formulaire/responses/${formId}`;
      const body = JSON.stringify(
        responses.map(r => {
          return {
            id: r.id,
            question_id: r.questionId,
            answer: r.answer,
            choice_id: r.choiceId,
            custom_answer: r.customAnswer,
          } as IBackendQuestionResponse;
        }),
      );
      return fetchWithCache(api, {
        method: 'DELETE',
        body,
      });
    },
  },
  response: {
    put: async (
      session: ISession,
      responseId: number,
      distributionId: number,
      questionId: number,
      choiceId: number | null,
      answer: string,
      customAnswer: string | null,
    ) => {
      const api = `/formulaire/responses/${responseId}`;
      const body = JSON.stringify({
        distribution_id: distributionId,
        question_id: questionId,
        choice_id: choiceId,
        answer,
        reponder_id: session.user.id,
        custom_answer: customAnswer,
      });
      const response = (await signedFetchJson(`${session.platform.url}${api}`, {
        method: 'PUT',
        body,
      })) as IBackendQuestionResponse;
      return questionResponseAdapter(response);
    },
    getFiles: async (session: ISession, responseId: number) => {
      const api = `/formulaire/responses/${responseId}/files/all`;
      const files = (await fetchJSONWithCache(api)) as IBackendResponseFileList;
      return files.map(responseFileAdapter);
    },
    addFile: async (session: ISession, responseId: number, file: LocalFile) => {
      const api = `/formulaire/responses/${responseId}/files`;
      const { firstName, lastName } = session.user;
      if (!file.filename.startsWith(firstName)) {
        file.filename = `${firstName}${lastName}_${file.filename}`;
      }
      return fileHandlerService.uploadFile<SyncedFileWithId>(
        session,
        file,
        {
          url: api,
          headers: {
            Accept: 'application/json',
          },
        },
        data => {
          const json = JSON.parse(data) as { id: string };
          return {
            url: `/formulaire/responses/${responseId}/files/${json.id}`,
            id: json.id,
          };
        },
        undefined,
        SyncedFileWithId,
      );
    },
    deleteFiles: async (session: ISession, responseId: number) => {
      const api = `/formulaire/responses/${responseId}/files`;
      return fetchWithCache(api, {
        method: 'DELETE',
      });
    },
  },
  section: {
    getQuestions: async (session: ISession, sectionId: number) => {
      const api = `/formulaire/sections/${sectionId}/questions`;
      const questions = (await fetchJSONWithCache(api)) as IBackendQuestionList;
      questions.sort(compareSectionQuestions);
      return questions.map(questionAdapter);
    },
  },
};
