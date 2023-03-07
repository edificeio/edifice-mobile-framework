import { Moment } from 'moment';
import { NavigationInjectedProps } from 'react-navigation';
import { ThunkDispatch } from 'redux-thunk';

import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { IUserSession } from '~/framework/util/session';
import { IConfig, IService } from '~/modules/homeworkAssistance/reducer';

interface IChild {
  value: string;
  label: string;
  firstName: string;
  lastName: string;
}

export interface IHomeworkAssistanceRequestScreenDataProps {
  className: string;
  config: IConfig;
  initialLoadingState: AsyncPagedLoadingState;
  services: IService[];
  session: IUserSession;
  structureName: string;
  children?: IChild[];
}

export interface IHomeworkAssistanceRequestScreenEventProps {
  addRequest: (
    service: IService,
    phoneNumber: string,
    date: Moment,
    time: Moment,
    student: IChild | null,
    structureName: string,
    className: string,
    information: string,
  ) => Promise<unknown>;
  fetchConfig: () => Promise<IConfig[]>;
  fetchServices: () => Promise<IService[]>;
  dispatch: ThunkDispatch<any, any, any>;
}

export type IHomeworkAssistanceRequestScreenProps = IHomeworkAssistanceRequestScreenDataProps &
  IHomeworkAssistanceRequestScreenEventProps &
  NavigationInjectedProps;
