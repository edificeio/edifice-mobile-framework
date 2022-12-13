/**
 * Homework assistance actions
 */
import { ThunkAction } from 'redux-thunk';

import { createAsyncActionCreators } from '~/framework/util/redux/async';
import { getUserSession } from '~/framework/util/session';
import { IConfig, actionTypes } from '~/modules/homeworkAssistance/reducer';
import { homeworkAssistanceService } from '~/modules/homeworkAssistance/service';

/**
 * Fetch the config.
 */
export const homeworkAssistanceConfigActionsCreators = createAsyncActionCreators(actionTypes.config);
export const fetchHomeworkAssistanceConfigAction =
  (): ThunkAction<Promise<IConfig>, any, any, any> => async (dispatch, getState) => {
    try {
      const session = getUserSession();
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
  (): ThunkAction<Promise<string[]>, any, any, any> => async (dispatch, getState) => {
    try {
      const session = getUserSession();
      dispatch(homeworkAssistanceServicesActionsCreators.request());
      const services = await homeworkAssistanceService.services.get(session);
      dispatch(homeworkAssistanceServicesActionsCreators.receipt(services));
      return services;
    } catch (e) {
      dispatch(homeworkAssistanceServicesActionsCreators.error(e as Error));
      throw e;
    }
  };
