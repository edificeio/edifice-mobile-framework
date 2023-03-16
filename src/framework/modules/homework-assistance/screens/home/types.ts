import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import { FormNavigationParams } from '~/framework/modules/form/navigation';
import { IConfig } from '~/framework/modules/homework-assistance/model';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface HomeworkAssistanceHomeScreenProps {
  config: IConfig;
  initialLoadingState: AsyncPagedLoadingState;
  session?: ISession;
  fetchConfig: () => Promise<IConfig>;
}

export interface HomeworkAssistanceHomeScreenNavParams {}

export interface HomeworkAssistanceHomeScreenPrivateProps
  extends NativeStackScreenProps<FormNavigationParams, 'home'>,
    HomeworkAssistanceHomeScreenProps {
  // @scaffolder add HOC props here
}
