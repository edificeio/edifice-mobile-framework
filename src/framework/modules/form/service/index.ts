import {
  compareChoices,
  compareMatrixChildren,
  compareSectionQuestions,
  distributionAdapter,
  formAdapter,
  questionAdapter,
  questionChoiceAdapter,
  questionResponseAdapter,
  responseFileAdapter,
  sectionAdapter,
} from './adapters';
import {
  IBackendDistribution,
  IBackendDistributionList,
  IBackendForm,
  IBackendFormList,
  IBackendQuestionChoiceList,
  IBackendQuestionList,
  IBackendQuestionResponse,
  IBackendQuestionResponseList,
  IBackendResponseFileList,
  IBackendSectionList,
} from './types';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { IDistribution, IQuestionResponse } from '~/framework/modules/form/model';
import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';
import fileHandlerService from '~/framework/util/fileHandler/service';
import { sessionFetch } from '~/framework/util/transport';

export const formService = {
  distribution: {
    add: async (session: AuthActiveAccount, distributionId: number) => {
      const api = `/formulaire/distributions/${distributionId}/add`;
      const distribution = await sessionFetch.json<IBackendDistribution>(api, { method: 'POST' });
      return distributionAdapter(distribution);
    },
    deleteQuestionResponses: async (session: AuthActiveAccount, distributionId: number, questionId: number) => {
      const api = `/formulaire/responses/${distributionId}/questions/${questionId}`;
      return sessionFetch.json<[]>(api, { method: 'DELETE' });
    },
    duplicate: async (session: AuthActiveAccount, distributionId: number) => {
      const api = `/formulaire/distributions/${distributionId}/duplicate`;
      const distribution = await sessionFetch.json<IBackendDistribution>(api, { method: 'POST' });
      return distributionAdapter(distribution);
    },
    get: async (session: AuthActiveAccount, distributionId: number) => {
      const api = `/formulaire/distributions/${distributionId}`;
      const distribution = await sessionFetch.json<IBackendDistribution>(api);
      return distributionAdapter(distribution);
    },
    getResponses: async (session: AuthActiveAccount, distributionId: number) => {
      const api = `/formulaire/distributions/${distributionId}/responses`;
      const responses = await sessionFetch.json<IBackendQuestionResponseList>(api);
      return responses.map(questionResponseAdapter);
    },
    put: async (session: AuthActiveAccount, distribution: IDistribution) => {
      const api = `/formulaire/distributions/${distribution.id}`;
      const body = JSON.stringify(distribution);
      const distrib = await sessionFetch.json<IBackendDistribution>(api, { body, method: 'PUT' });
      return distributionAdapter(distrib);
    },
    replace: async (session: AuthActiveAccount, distributionId: number, originalDistributionId: number) => {
      const api = `/formulaire/distributions/${distributionId}/replace/${originalDistributionId}`;
      const distribution = await sessionFetch.json<IBackendDistribution>(api, { method: 'DELETE' });
      return distributionAdapter(distribution);
    },
  },
  distributions: {
    list: async (session: AuthActiveAccount) => {
      const api = '/formulaire/distributions/listMine';
      const distributions = await sessionFetch.json<IBackendDistributionList>(api);
      return distributions.map(distributionAdapter);
    },
    listFromForm: async (session: AuthActiveAccount, formId: number) => {
      const api = `/formulaire/distributions/forms/${formId}/listMine`;
      const distributions = await sessionFetch.json<IBackendDistributionList>(api);
      return distributions.map(distributionAdapter);
    },
  },
  form: {
    get: async (session: AuthActiveAccount, id: number) => {
      const api = `/formulaire/forms/${id}`;
      const form = await sessionFetch.json<IBackendForm>(api);
      return formAdapter(form);
    },
    getElementsCount: async (session: AuthActiveAccount, formId: number) => {
      const api = `/formulaire/forms/${formId}/elements/count`;
      const data = await sessionFetch.json<{ count: number }>(api);
      return data.count;
    },
    getQuestions: async (session: AuthActiveAccount, formId: number) => {
      const api = `/formulaire/forms/${formId}/questions`;
      const questions = await sessionFetch.json<IBackendQuestionList>(api);
      return questions.map(questionAdapter);
    },
    getSections: async (session: AuthActiveAccount, formId: number) => {
      const api = `/formulaire/forms/${formId}/sections`;
      const sections = await sessionFetch.json<IBackendSectionList>(api);
      return sections.map(sectionAdapter);
    },
    hasResponderRight: async (session: AuthActiveAccount, formId: number) => {
      const api = `/formulaire/forms/${formId}/rights`;
      const rights = await sessionFetch.json<Array<{ action: string }>>(api);
      return rights.some(r => r.action === 'fr-openent-formulaire-controllers-FormController|initResponderResourceRight');
    },
  },
  forms: {
    getReceived: async (session: AuthActiveAccount) => {
      const api = '/formulaire/forms/sent';
      const forms = await sessionFetch.json<IBackendFormList>(api);
      return forms.map(formAdapter);
    },
  },
  question: {
    createResponse: async (
      session: AuthActiveAccount,
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
      const response = await sessionFetch.json<IBackendQuestionResponse>(api, { body, method: 'POST' });
      return questionResponseAdapter(response);
    },
    getChoices: async (session: AuthActiveAccount, questionId: number) => {
      const api = `/formulaire/questions/${questionId}/choices`;
      const headers = {
        Accept: 'application/json;version=1.9',
      };
      const choices = await sessionFetch.json<IBackendQuestionChoiceList>(api, { headers });
      choices.sort(compareChoices);
      return choices.map(choice => questionChoiceAdapter(choice, session.platform.url));
    },
    getDistributionResponses: async (session: AuthActiveAccount, questionId: number, distributionId: number) => {
      const api = `/formulaire/questions/${questionId}/distributions/${distributionId}/responses`;
      const responses = await sessionFetch.json<IBackendQuestionResponseList>(api);
      return responses.map(questionResponseAdapter);
    },
  },
  questions: {
    getAllChoices: async (session: AuthActiveAccount, questionIds: number[]) => {
      let api = `/formulaire/questions/choices/all?`;
      questionIds.forEach((value, index) => (api += `${index}=${value}&`));
      const headers = {
        Accept: 'application/json;version=1.9',
      };
      const choices = await sessionFetch.json<IBackendQuestionChoiceList>(api, { headers });
      choices.sort(compareChoices);
      return choices.map(choice => questionChoiceAdapter(choice, session.platform.url));
    },
    getChildren: async (session: AuthActiveAccount, questionIds: number[]) => {
      let api = `/formulaire/questions/children?`;
      questionIds.forEach((value, index) => (api += `${index}=${value}&`));
      const children = await sessionFetch.json<IBackendQuestionList>(api);
      children.sort(compareMatrixChildren);
      return children.map(questionAdapter);
    },
  },
  response: {
    addFile: async (session: AuthActiveAccount, responseId: number, file: LocalFile) => {
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
    deleteFiles: async (session: AuthActiveAccount, responseId: number) => {
      const api = `/formulaire/responses/${responseId}/files`;
      return sessionFetch(api, { method: 'DELETE' });
    },
    getFiles: async (session: AuthActiveAccount, responseId: number) => {
      const api = `/formulaire/responses/${responseId}/files/all`;
      const files = await sessionFetch.json<IBackendResponseFileList>(api);
      return files.map(responseFileAdapter);
    },
    put: async (
      session: AuthActiveAccount,
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
      const response = await sessionFetch.json<IBackendQuestionResponse>(api, { body, method: 'PUT' });
      return questionResponseAdapter(response);
    },
  },
  responses: {
    delete: async (session: AuthActiveAccount, formId: number, responses: IQuestionResponse[]) => {
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
      return sessionFetch(api, { body, method: 'DELETE' });
    },
  },
  section: {
    getQuestions: async (session: AuthActiveAccount, sectionId: number) => {
      const api = `/formulaire/sections/${sectionId}/questions`;
      const questions = await sessionFetch.json<IBackendQuestionList>(api);
      questions.sort(compareSectionQuestions);
      return questions.map(questionAdapter);
    },
  },
};
