/**
 * Homework assistance actions
 */
import { Moment } from 'moment';
import { ThunkAction } from 'redux-thunk';

import { UserChild } from '~/framework/modules/auth/model';
import { assertSession } from '~/framework/modules/auth/reducer';
import { IConfig, IService } from '~/framework/modules/homework-assistance/model';
import { actionTypes } from '~/framework/modules/homework-assistance/reducer';
import { homeworkAssistanceService } from '~/framework/modules/homework-assistance/service';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

/**
 * Fetch the config.
 */
export const homeworkAssistanceConfigActionsCreators = createAsyncActionCreators(actionTypes.config);
export const fetchHomeworkAssistanceConfigAction =
  (): ThunkAction<Promise<IConfig>, any, any, any> => async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(homeworkAssistanceConfigActionsCreators.request());
      const config = await homeworkAssistanceService.config.get(session);
      dispatch(homeworkAssistanceConfigActionsCreators.receipt(config));
      return config;
    } catch (e) {
      dispatch(homeworkAssistanceConfigActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the services.
 */
export const homeworkAssistanceServicesActionsCreators = createAsyncActionCreators(actionTypes.services);
export const fetchHomeworkAssistanceServicesAction =
  (): ThunkAction<Promise<IService[]>, any, any, any> => async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(homeworkAssistanceServicesActionsCreators.request());
      const services = await homeworkAssistanceService.services.get(session);
      dispatch(homeworkAssistanceServicesActionsCreators.receipt(services));
      return services;
    } catch (e) {
      dispatch(homeworkAssistanceServicesActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Send the filled request.
 */
export const postHomeworkAssistanceRequestAction =
  (
    service: IService,
    phoneNumber: string,
    date: Moment,
    time: Moment,
    student: UserChild | null,
    structureName: string,
    className: string,
    information: string,
  ) =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      const firstName = student?.firstName ?? session.user.firstName;
      const lastName = student?.lastName ?? session.user.lastName;
      const response = await homeworkAssistanceService.service.addRequest(
        session,
        service,
        phoneNumber,
        date,
        time,
        firstName,
        lastName,
        structureName,
        className,
        information,
      );
      if (response.status === 'OK') {
        Promise.resolve();
      } else {
        Promise.reject(response);
      }
    } catch (e) {
      return Promise.reject(e);
    }
  };
