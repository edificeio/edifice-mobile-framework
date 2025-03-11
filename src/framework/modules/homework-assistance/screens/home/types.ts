import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import {
  fetchHomeworkAssistanceConfigAction,
  fetchHomeworkAssistanceResourcesAction,
} from '~/framework/modules/homework-assistance/actions';
import { Config, Resource } from '~/framework/modules/homework-assistance/model';
import {
  HomeworkAssistanceNavigationParams,
  homeworkAssistanceRouteNames,
} from '~/framework/modules/homework-assistance/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface HomeworkAssistanceHomeScreenProps {}

export interface HomeworkAssistanceHomeScreenNavParams {}

export interface HomeworkAssistanceHomeScreenStoreProps {
  initialLoadingState: AsyncPagedLoadingState;
  resources: Resource[];
  config?: Config;
  session?: AuthActiveAccount;
}

export interface HomeworkAssistanceHomeScreenDispatchProps {
  tryFetchConfig: (...args: Parameters<typeof fetchHomeworkAssistanceConfigAction>) => Promise<Config>;
  tryFetchResources: (...args: Parameters<typeof fetchHomeworkAssistanceResourcesAction>) => Promise<Resource[]>;
}

export type HomeworkAssistanceHomeScreenPrivateProps = HomeworkAssistanceHomeScreenProps &
  HomeworkAssistanceHomeScreenStoreProps &
  HomeworkAssistanceHomeScreenDispatchProps &
  NativeStackScreenProps<HomeworkAssistanceNavigationParams, typeof homeworkAssistanceRouteNames.home>;
