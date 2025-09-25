import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import {
  fetchHomeworkAssistanceParametersAction,
  fetchHomeworkAssistanceResourcesAction,
} from '~/framework/modules/homework-assistance/actions';
import { ModuleParameters, Resource } from '~/framework/modules/homework-assistance/model';
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
  parameters?: ModuleParameters;
  session?: AuthActiveAccount;
}

export interface HomeworkAssistanceHomeScreenDispatchProps {
  tryFetchParameters: (...args: Parameters<typeof fetchHomeworkAssistanceParametersAction>) => Promise<ModuleParameters>;
  tryFetchResources: (...args: Parameters<typeof fetchHomeworkAssistanceResourcesAction>) => Promise<Resource[]>;
}

export type HomeworkAssistanceHomeScreenPrivateProps = HomeworkAssistanceHomeScreenProps &
  HomeworkAssistanceHomeScreenStoreProps &
  HomeworkAssistanceHomeScreenDispatchProps &
  NativeStackScreenProps<HomeworkAssistanceNavigationParams, typeof homeworkAssistanceRouteNames.home>;
