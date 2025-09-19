import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount, UserChild } from '~/framework/modules/auth/model';
import {
  fetchHomeworkAssistanceParametersAction,
  fetchHomeworkAssistanceServicesAction,
  postHomeworkAssistanceRequestAction,
} from '~/framework/modules/homework-assistance/actions';
import { ModuleParameters, Service } from '~/framework/modules/homework-assistance/model';
import {
  HomeworkAssistanceNavigationParams,
  homeworkAssistanceRouteNames,
} from '~/framework/modules/homework-assistance/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

interface IChild extends UserChild {
  value: string;
  label: string;
}

export interface HomeworkAssistanceRequestScreenProps {}

export interface HomeworkAssistanceRequestScreenNavParams {}

export interface HomeworkAssistanceRequestScreenStoreProps {
  className: string;
  initialLoadingState: AsyncPagedLoadingState;
  services: Service[];
  structureName: string;
  children?: IChild[];
  parameters?: ModuleParameters;
  session?: AuthActiveAccount;
}

export interface HomeworkAssistanceRequestScreenDispatchProps {
  tryAddRequest: (...args: Parameters<typeof postHomeworkAssistanceRequestAction>) => Promise<unknown>;
  tryFetchParameters: (...args: Parameters<typeof fetchHomeworkAssistanceParametersAction>) => Promise<ModuleParameters>;
  tryFetchServices: (...args: Parameters<typeof fetchHomeworkAssistanceServicesAction>) => Promise<Service[]>;
}

export type HomeworkAssistanceRequestScreenPrivateProps = HomeworkAssistanceRequestScreenProps &
  HomeworkAssistanceRequestScreenStoreProps &
  HomeworkAssistanceRequestScreenDispatchProps &
  NativeStackScreenProps<HomeworkAssistanceNavigationParams, typeof homeworkAssistanceRouteNames.request>;
