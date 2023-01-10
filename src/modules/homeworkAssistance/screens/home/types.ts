import { NavigationInjectedProps } from 'react-navigation';
import { ThunkDispatch } from 'redux-thunk';

import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { IUserSession } from '~/framework/util/session';
import { IConfig } from '~/modules/homeworkAssistance/reducer';

export interface IHomeworkAssistanceHomeScreenDataProps {
  config: IConfig;
  initialLoadingState: AsyncPagedLoadingState;
  session: IUserSession;
}

export interface IHomeworkAssistanceHomeScreenEventProps {
  fetchConfig: () => Promise<IConfig[]>;
  dispatch: ThunkDispatch<any, any, any>;
}

export type IHomeworkAssistanceHomeScreenProps = IHomeworkAssistanceHomeScreenDataProps &
  IHomeworkAssistanceHomeScreenEventProps &
  NavigationInjectedProps;
