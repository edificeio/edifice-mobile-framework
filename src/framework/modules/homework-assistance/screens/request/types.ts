import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Moment } from 'moment';

import { ISession, UserChild } from '~/framework/modules/auth/model';
import { IConfig, IService } from '~/framework/modules/homework-assistance/model';
import { HomeworkAssistanceNavigationParams } from '~/framework/modules/homework-assistance/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

interface IChild extends UserChild {
  value: string;
  label: string;
}

export interface HomeworkAssistanceRequestScreenProps {
  className: string;
  initialLoadingState: AsyncPagedLoadingState;
  services: IService[];
  structureName: string;
  children?: IChild[];
  config?: IConfig;
  session?: ISession;
  addRequest: (
    service: IService,
    phoneNumber: string,
    date: Moment,
    time: Moment,
    student: UserChild | null,
    structureName: string,
    className: string,
    information: string,
  ) => Promise<unknown>;
  fetchConfig: () => Promise<IConfig>;
  fetchServices: () => Promise<IService[]>;
}

export interface HomeworkAssistanceRequestScreenNavParams {}

export interface HomeworkAssistanceRequestScreenPrivateProps
  extends NativeStackScreenProps<HomeworkAssistanceNavigationParams, 'request'>,
    HomeworkAssistanceRequestScreenProps {
  // @scaffolder add HOC props here
}
