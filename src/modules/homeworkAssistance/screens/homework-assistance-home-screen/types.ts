import { NavigationInjectedProps } from 'react-navigation';
import { ThunkDispatch } from 'redux-thunk';

import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { IUserSession } from '~/framework/util/session';
import { IConfig } from '~/modules/homeworkAssistance/reducer';

export interface IHomeworkAssistanceHomeScreen_DataProps {
  config: IConfig;
  initialLoadingState: AsyncPagedLoadingState;
  session: IUserSession;
}

export interface IHomeworkAssistanceHomeScreen_EventProps {
  fetchConfig: () => Promise<IConfig[]>;
  dispatch: ThunkDispatch<any, any, any>;
}

export type IHomeworkAssistanceHomeScreen_Props = IHomeworkAssistanceHomeScreen_DataProps &
  IHomeworkAssistanceHomeScreen_EventProps &
  NavigationInjectedProps;
