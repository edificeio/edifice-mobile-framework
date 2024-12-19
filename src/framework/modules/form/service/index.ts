import moment from 'moment';

import { AuthLoggedAccount } from '~/framework/modules/auth/model';
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

const formAdapter = (data: IBackendForm): IForm => {
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

const questionAdapter = (data: IBackendQuestion): IQuestion => {
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

const compareChoices = (a: IBackendQuestionChoice, b: IBackendQuestionChoice): number => {
  return a.position - b.position;
};

const questionResponseAdapter = (data: IBackendQuestionResponse): IQuestionResponse => {
  return {
    answer: data.answer,
    choiceId: data.choice_id,
    choicePosition: data.choice_position,
    customAnswer: data.custom_answer,
    id: data.id,
    questionId: data.question_id,
  };
};

const responseFileAdapter = (data: IBackendResponseFile): IResponseFile => {
  return {
    filename: data.filename,
    id: data.id,
    responseId: data.response_id,
    type: data.type,
  };
};

const sectionAdapter = (data: IBackendSection): ISection => {
  return {
    description: data.description,
    formId: data.form_id,
    id: data.id,
    position: data.position,
    questions: [],
    title: data.title,
  };
};

export const formService = {
  distribution: {
    add: async (session: AuthLoggedAccount, distributionId: number) => {
      const api = `/formulaire/distributions/${distributionId}/add`;
      const distribution = (await signedFetchJson(`${session.platform.url}${api}`, {
        method: 'POST',
      })) as IBackendDistribution;
      return distributionAdapter(distribution);
    },
    deleteQuestionResponses: async (session: AuthLoggedAccount, distributionId: number, questionId: number) => {
      const api = `/formulaire/responses/${distributionId}/questions/${questionId}`;
      return signedFetchJson(`${session.platform.url}${api}`, {
        method: 'DELETE',
      }) as Promise<[]>;
    },
    duplicate: async (session: AuthLoggedAccount, distributionId: number) => {
      const api = `/formulaire/distributions/${distributionId}/duplicate`;
      const distribution = (await signedFetchJson(`${session.platform.url}${api}`, {
        method: 'POST',
      })) as IBackendDistribution;
      return distributionAdapter(distribution);
    },
    get: async (session: AuthLoggedAccount, distributionId: number) => {
      const api = `/formulaire/distributions/${distributionId}`;
      const distribution = (await fetchJSONWithCache(api)) as IBackendDistribution;
      return distributionAdapter(distribution);
    },
    getResponses: async (session: AuthLoggedAccount, distributionId: number) => {
      const api = `/formulaire/distributions/${distributionId}/responses`;
      const responses = (await fetchJSONWithCache(api)) as IBackendQuestionResponseList;
      return responses.map(questionResponseAdapter);
    },
    put: async (session: AuthLoggedAccount, distribution: IDistribution) => {
      const api = `/formulaire/distributions/${distribution.id}`;
      const body = JSON.stringify(distribution);
      const distrib = (await signedFetchJson(`${session.platform.url}${api}`, {
        body,
        method: 'PUT',
      })) as IBackendDistribution;
      return distributionAdapter(distrib);
    },
    replace: async (session: AuthLoggedAccount, distributionId: number, originalDistributionId: number) => {
      const api = `/formulaire/distributions/${distributionId}/replace/${originalDistributionId}`;
      const distribution = (await signedFetchJson(`${session.platform.url}${api}`, {
        method: 'DELETE',
      })) as IBackendDistribution;
      return distributionAdapter(distribution);
    },
  },
  distributions: {
    list: async (session: AuthLoggedAccount) => {
      const api = '/formulaire/distributions/listMine';
      const distributions = (await fetchJSONWithCache(api)) as IBackendDistributionList;
      return distributions.map(distributionAdapter);
    },
    listFromForm: async (session: AuthLoggedAccount, formId: number) => {
      const api = `/formulaire/distributions/forms/${formId}/listMine`;
      const distributions = (await fetchJSONWithCache(api)) as IBackendDistributionList;
      return distributions.map(distributionAdapter);
    },
  },
  form: {
    get: async (session: AuthLoggedAccount, id: number) => {
      const api = `/formulaire/forms/${id}`;
      const form = (await fetchJSONWithCache(api)) as IBackendForm;
      return formAdapter(form);
    },
    getElementsCount: async (session: AuthLoggedAccount, formId: number) => {
      const api = `/formulaire/forms/${formId}/elements/count`;
      const data = (await fetchJSONWithCache(api)) as { count: number };
      return data.count;
    },
    getQuestions: async (session: AuthLoggedAccount, formId: number) => {
      const api = `/formulaire/forms/${formId}/questions`;
      const questions = (await fetchJSONWithCache(api)) as IBackendQuestionList;
      return questions.map(questionAdapter);
    },
    getSections: async (session: AuthLoggedAccount, formId: number) => {
      const api = `/formulaire/forms/${formId}/sections`;
      const sections = (await fetchJSONWithCache(api)) as IBackendSectionList;
      return sections.map(sectionAdapter);
    },
    hasResponderRight: async (session: AuthLoggedAccount, formId: number) => {
      const api = `/formulaire/forms/${formId}/rights`;
      const rights = (await fetchJSONWithCache(api)) as { action: string }[];
      return rights.some(r => r.action === 'fr-openent-formulaire-controllers-FormController|initResponderResourceRight');
    },
  },
  forms: {
    getReceived: async (session: AuthLoggedAccount) => {
      const api = '/formulaire/forms/sent';
      const forms = (await fetchJSONWithCache(api)) as IBackendFormList;
      return forms.map(formAdapter);
    },
  },
  question: {
    createResponse: async (
      session: AuthLoggedAccount,
      questionId: number,
      distributionId: number,
      choiceId: number | null,
      answer: string,
      customAnswer: string | null,
      choicePosition: number | null,
    ) => {
      const api = `/formulaire/questions/${questionId}/responses`;
      const body = JSON.stringify({
        answer,
        choice_id: choiceId,
        choice_position: choicePosition,
        custom_answer: customAnswer,
        distribution_id: distributionId,
        question_id: questionId,
        responder_id: session.user.id,
      });
      const response = (await signedFetchJson(`${session.platform.url}${api}`, {
        body,
        method: 'POST',
      })) as IBackendQuestionResponse;
      return questionResponseAdapter(response);
    },
    getChoices: async (session: AuthLoggedAccount, questionId: number) => {
      const api = `/formulaire/questions/${questionId}/choices`;
      const headers = {
        Accept: 'application/json;version=1.9',
      };
      const choices = (await fetchJSONWithCache(api, { headers })) as IBackendQuestionChoiceList;
      choices.sort(compareChoices);
      return choices.map(choice => questionChoiceAdapter(choice, session.platform.url));
    },
    getDistributionResponses: async (session: AuthLoggedAccount, questionId: number, distributionId: number) => {
      const api = `/formulaire/questions/${questionId}/distributions/${distributionId}/responses`;
      const responses = (await fetchJSONWithCache(api)) as IBackendQuestionResponseList;
      return responses.map(questionResponseAdapter);
    },
  },
  questions: {
    getAllChoices: async (session: AuthLoggedAccount, questionIds: number[]) => {
      let api = `/formulaire/questions/choices/all?`;
      questionIds.forEach((value, index) => (api += `${index}=${value}&`));
      const headers = {
        Accept: 'application/json;version=1.9',
      };
      const choices = (await fetchJSONWithCache(api, { headers })) as IBackendQuestionChoiceList;
      choices.sort(compareChoices);
      return choices.map(choice => questionChoiceAdapter(choice, session.platform.url));
    },
    getChildren: async (session: AuthLoggedAccount, questionIds: number[]) => {
      let api = `/formulaire/questions/children?`;
      questionIds.forEach((value, index) => (api += `${index}=${value}&`));
      const children = (await fetchJSONWithCache(api)) as IBackendQuestionList;
      children.sort(compareMatrixChildren);
      return children.map(questionAdapter);
    },
  },
  response: {
    addFile: async (session: AuthLoggedAccount, responseId: number, file: LocalFile) => {
      const api = `/formulaire/responses/${responseId}/files`;
      const { firstName, lastName } = session.user;
      if (!file.filename.startsWith(firstName)) {
        file.filename = `${firstName}${lastName}_${file.filename}`;
      }
      return fileHandlerService.uploadFile<SyncedFileWithId>(
        session,
        file,
        {
          headers: {
            Accept: 'application/json',
          },
          url: api,
        },
        data => {
          const json = JSON.parse(data) as { id: string };
          return {
            id: json.id,
            url: `/formulaire/responses/${responseId}/files/${json.id}`,
          };
        },
        undefined,
        SyncedFileWithId,
      );
    },
    deleteFiles: async (session: AuthLoggedAccount, responseId: number) => {
      const api = `/formulaire/responses/${responseId}/files`;
      return fetchWithCache(api, {
        method: 'DELETE',
      });
    },
    getFiles: async (session: AuthLoggedAccount, responseId: number) => {
      const api = `/formulaire/responses/${responseId}/files/all`;
      const files = (await fetchJSONWithCache(api)) as IBackendResponseFileList;
      return files.map(responseFileAdapter);
    },
    put: async (
      session: AuthLoggedAccount,
      responseId: number,
      distributionId: number,
      questionId: number,
      choiceId: number | null,
      answer: string,
      customAnswer: string | null,
    ) => {
      const api = `/formulaire/responses/${responseId}`;
      const body = JSON.stringify({
        answer,
        choice_id: choiceId,
        custom_answer: customAnswer,
        distribution_id: distributionId,
        question_id: questionId,
        reponder_id: session.user.id,
      });
      const response = (await signedFetchJson(`${session.platform.url}${api}`, {
        body,
        method: 'PUT',
      })) as IBackendQuestionResponse;
      return questionResponseAdapter(response);
    },
  },
  responses: {
    delete: async (session: AuthLoggedAccount, formId: number, responses: IQuestionResponse[]) => {
      const api = `/formulaire/responses/${formId}`;
      const body = JSON.stringify(
        responses.map(r => {
          return {
            answer: r.answer,
            choice_id: r.choiceId,
            custom_answer: r.customAnswer,
            id: r.id,
            question_id: r.questionId,
          } as IBackendQuestionResponse;
        }),
      );
      return fetchWithCache(api, {
        body,
        method: 'DELETE',
      });
    },
  },
  section: {
    getQuestions: async (session: AuthLoggedAccount, sectionId: number) => {
      const api = `/formulaire/sections/${sectionId}/questions`;
      const questions = (await fetchJSONWithCache(api)) as IBackendQuestionList;
      questions.sort(compareSectionQuestions);
      return questions.map(questionAdapter);
    },
  },
};
