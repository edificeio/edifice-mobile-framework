import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { fetchHomeworkAssistanceConfigAction } from '~/framework/modules/homework-assistance/actions';
import { IConfig } from '~/framework/modules/homework-assistance/model';
import {
  HomeworkAssistanceNavigationParams,
  homeworkAssistanceRouteNames,
} from '~/framework/modules/homework-assistance/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface HomeworkAssistanceHomeScreenProps {}

export interface HomeworkAssistanceHomeScreenNavParams {}

export interface HomeworkAssistanceHomeScreenStoreProps {
  initialLoadingState: AsyncPagedLoadingState;
  config?: IConfig;
  session?: AuthActiveAccount;
}

export interface HomeworkAssistanceHomeScreenDispatchProps {
  tryFetchConfig: (...args: Parameters<typeof fetchHomeworkAssistanceConfigAction>) => Promise<IConfig>;
}

export type HomeworkAssistanceHomeScreenPrivateProps = HomeworkAssistanceHomeScreenProps &
  HomeworkAssistanceHomeScreenStoreProps &
  HomeworkAssistanceHomeScreenDispatchProps &
  NativeStackScreenProps<HomeworkAssistanceNavigationParams, typeof homeworkAssistanceRouteNames.home>;
