/**
 * Homework assistance actions
 */
import { Moment } from 'moment';
import { ThunkAction } from 'redux-thunk';

import { UserChild } from '~/framework/modules/auth/model';
import { assertSession } from '~/framework/modules/auth/reducer';
import { Config, Resource, Service } from '~/framework/modules/homework-assistance/model';
import { actionTypes } from '~/framework/modules/homework-assistance/reducer';
import { homeworkAssistanceService } from '~/framework/modules/homework-assistance/service';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

export const homeworkAssistanceConfigActionsCreators = createAsyncActionCreators(actionTypes.config);
export const fetchHomeworkAssistanceConfigAction =
  (): ThunkAction<Promise<Config>, any, any, any> => async (dispatch, getState) => {
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

export const homeworkAssistanceResourcesActionsCreators = createAsyncActionCreators(actionTypes.resources);
export const fetchHomeworkAssistanceResourcesAction =
  (): ThunkAction<Promise<Resource[]>, any, any, any> => async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(homeworkAssistanceResourcesActionsCreators.request());
      const resources = await homeworkAssistanceService.resources.get(session);
      dispatch(homeworkAssistanceResourcesActionsCreators.receipt(resources));
      return resources;
    } catch (e) {
      dispatch(homeworkAssistanceResourcesActionsCreators.error(e as Error));
      throw e;
    }
  };

export const homeworkAssistanceServicesActionsCreators = createAsyncActionCreators(actionTypes.services);
export const fetchHomeworkAssistanceServicesAction =
  (): ThunkAction<Promise<Service[]>, any, any, any> => async (dispatch, getState) => {
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

export const postHomeworkAssistanceRequestAction =
  (
    service: Service,
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
