import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession } from '~/framework/modules/auth/model';
import type { fetchDistributionResponsesAction, fetchFormContentAction } from '~/framework/modules/form/actions';
import type { DistributionStatus, IFormContent, IFormElement, IQuestionResponse } from '~/framework/modules/form/model';
import type { FormNavigationParams, formRouteNames } from '~/framework/modules/form/navigation';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface FormDistributionScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
  structures: { label: string; value: string }[];
}

export interface FormDistributionScreenNavParams {
  editable: boolean;
  formId: number;
  id: number;
  status: DistributionStatus;
  title: string;
}

export interface FormDistributionScreenStoreProps {
  elements: IFormElement[];
  elementsCount: number;
  session?: ISession;
}

export interface FormDistributionScreenDispatchProps {
  tryFetchDistributionResponses: (...args: Parameters<typeof fetchDistributionResponsesAction>) => Promise<IQuestionResponse[]>;
  tryFetchFormContent: (...args: Parameters<typeof fetchFormContentAction>) => Promise<IFormContent>;
}

export type FormDistributionScreenPrivateProps = FormDistributionScreenProps &
  FormDistributionScreenStoreProps &
  FormDistributionScreenDispatchProps &
  NativeStackScreenProps<FormNavigationParams, typeof formRouteNames.distribution>;
