/**
 * Form actions
 */
import { ThunkAction } from 'redux-thunk';

import { createAsyncActionCreators } from '~/framework/util/redux/async';
import { getUserSession } from '~/framework/util/session';
import {
  IDistribution,
  IForm,
  IFormContent,
  IFormElement,
  IQuestionChoice,
  IQuestionResponse,
  IResponseFile,
  QuestionType,
  actionTypes,
} from '~/modules/form/reducer';
import { formService } from '~/modules/form/service';

/**
 * Fetch the distributions of the forms sent to me.
 */
export const formListDistributionsActionsCreators = createAsyncActionCreators(actionTypes.listDistributionsReceived);
export const fetchFormDistributionsAction =
  (): ThunkAction<Promise<IDistribution[]>, any, any, any> => async (dispatch, getState) => {
    try {
      const session = getUserSession();
      dispatch(formListDistributionsActionsCreators.request());
      const distributions = await formService.distributions.listMine(session);
      dispatch(formListDistributionsActionsCreators.receipt(distributions));
      return distributions;
    } catch (e) {
      dispatch(formListDistributionsActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the forms sent to me.
 */
export const formListFormsReceivedActionsCreators = createAsyncActionCreators(actionTypes.listFormsReceived);
export const fetchFormsReceivedAction = (): ThunkAction<Promise<IForm[]>, any, any, any> => async (dispatch, getState) => {
  try {
    const session = getUserSession();
    dispatch(formListFormsReceivedActionsCreators.request());
    const forms = await formService.forms.getReceived(session);
    dispatch(formListFormsReceivedActionsCreators.receipt(forms));
    return forms;
  } catch (e) {
    dispatch(formListFormsReceivedActionsCreators.error(e as Error));
    throw e;
  }
};

/**
 * Fetch the elements of a specific form.
 */
export const formFormContentActionsCreators = createAsyncActionCreators(actionTypes.content);
export const fetchFormContentAction =
  (formId: number): ThunkAction<Promise<IFormContent>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = getUserSession();
      dispatch(formFormContentActionsCreators.request());
      const ret = await Promise.all([
        formService.form.getElementsCount(session, formId),
        formService.form.getQuestions(session, formId),
        formService.form.getSections(session, formId),
      ]);
      const formContent = {
        elements: [...ret[1], ...ret[2]].sort((a: IFormElement, b: IFormElement) => (a.position! > b.position! ? 1 : -1)),
        elementsCount: ret[0],
      };
      await Promise.all(
        formContent.elements.map(async element => {
          if (!('type' in element)) {
            element.questions = await formService.section.getQuestions(session, element.id);
            let choices: IQuestionChoice[] = [];
            if (element.questions.length) {
              const questionIds = element.questions.map(question => question.id);
              choices = await formService.questions.getAllChoices(session, questionIds);
            }
            element.questions.map(async question => {
              question.choices = choices.filter(choice => choice.questionId === question.id);
              if (question.type === QuestionType.MATRIX) {
                question.children = await formService.questions.getChildren(session, [question.id]);
              }
            });
          } else {
            element.choices = await formService.question.getChoices(session, element.id);
            if (element.type === QuestionType.MATRIX) {
              element.children = await formService.questions.getChildren(session, [element.id]);
            }
          }
          return element;
        }),
      );
      dispatch(formFormContentActionsCreators.receipt(formContent));
      return formContent;
    } catch (e) {
      dispatch(formFormContentActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the responses of a specific distribution.
 */
export const fetchDistributionResponsesAction =
  (distributionId: number): ThunkAction<Promise<IQuestionResponse[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = getUserSession();
      const responses = await formService.distribution.getResponses(session, distributionId);
      await Promise.all(
        responses.map(async response => {
          if (response.answer === 'Fichier déposé' && response.id) {
            response.files = await formService.response.getFiles(session, response.id);
          }
        }),
      );
      return responses;
    } catch (e) {
      throw e;
    }
  };

/**
 * Fetch the files of specified responses.
 */
export const fetchResponseFilesAction =
  (responseIds: number[]): ThunkAction<Promise<IResponseFile[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = getUserSession();
      const files: IResponseFile[] = [];
      await Promise.all(
        responseIds.map(async responseId => {
          const responseFiles = await formService.response.getFiles(session, responseId);
          files.concat(responseFiles);
        }),
      );
      return files;
    } catch (e) {
      throw e;
    }
  };
