import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession } from '~/framework/modules/auth/model';
import type { fetchFormDistributionsAction, fetchFormsReceivedAction } from '~/framework/modules/form/actions';
import type { IDistribution, IForm } from '~/framework/modules/form/model';
import type { FormNavigationParams, formRouteNames } from '~/framework/modules/form/navigation';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export type IFormDistributions = IForm & {
  distributions: IDistribution[];
};

export interface FormDistributionListScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
}

export interface FormDistributionListScreenNavParams {
  notificationFormId?: number;
}

export interface FormDistributionListScreenStoreProps {
  formDistributions: IFormDistributions[];
  session?: ISession;
}

export interface FormDistributionListScreenDispatchProps {
  tryFetchDistributions: (...args: Parameters<typeof fetchFormDistributionsAction>) => Promise<IDistribution[]>;
  tryFetchForms: (...args: Parameters<typeof fetchFormsReceivedAction>) => Promise<IForm[]>;
}

export type FormDistributionListScreenPrivateProps = FormDistributionListScreenProps &
  FormDistributionListScreenStoreProps &
  FormDistributionListScreenDispatchProps &
  NativeStackScreenProps<FormNavigationParams, typeof formRouteNames.home>;
