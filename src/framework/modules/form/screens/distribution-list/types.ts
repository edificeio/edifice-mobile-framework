import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import { IDistribution, IForm } from '~/framework/modules/form/model';
import { FormNavigationParams } from '~/framework/modules/form/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export type IFormDistributions = IForm & {
  distributions: IDistribution[];
};

export interface FormDistributionListScreenProps {
  formDistributions: IFormDistributions[];
  initialLoadingState: AsyncPagedLoadingState;
  session?: ISession;
  fetchDistributions: () => Promise<IDistribution[]>;
  fetchForms: () => Promise<IForm[]>;
}

export interface FormDistributionListScreenNavParams {
  notificationFormId?: number;
}

export interface FormDistributionListScreenPrivateProps
  extends NativeStackScreenProps<FormNavigationParams, 'home'>,
    FormDistributionListScreenProps {
  // @scaffolder add HOC props here
}
