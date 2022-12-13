import { NavigationInjectedProps } from 'react-navigation';
import { ThunkDispatch } from 'redux-thunk';

import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { IUserSession } from '~/framework/util/session';
import { IConfig } from '~/modules/homeworkAssistance/reducer';

export interface IHomeworkAssistanceRequestScreen_DataProps {
  config: IConfig;
  initialLoadingState: AsyncPagedLoadingState;
  services: {
    label: string;
    value: string;
  }[];
  session: IUserSession;
}

export interface IHomeworkAssistanceRequestScreen_EventProps {
  fetchConfig: () => Promise<IConfig[]>;
  fetchServices: () => Promise<string[]>;
  dispatch: ThunkDispatch<any, any, any>;
}

export type IHomeworkAssistanceRequestScreen_Props = IHomeworkAssistanceRequestScreen_DataProps &
  IHomeworkAssistanceRequestScreen_EventProps &
  NavigationInjectedProps;
