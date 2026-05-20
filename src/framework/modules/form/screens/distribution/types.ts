import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthLoggedAccount } from '~/framework/modules/auth/model';
import type {
  fetchDistributionResponsesAction,
  fetchFormContentAction,
  fetchGdprDelegatesAction,
} from '~/framework/modules/form/actions';
import type {
  DistributionStatus,
  IForm,
  IFormContent,
  IFormElement,
  IGdprDelegate,
  IQuestionResponse,
} from '~/framework/modules/form/model';
import type { FormNavigationParams, formRouteNames } from '~/framework/modules/form/navigation';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface FormDistributionScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
  structures: { label: string; value: string }[];
}

export interface FormDistributionScreenNavParams {
  form: IForm;
  id: number;
  status: DistributionStatus;
}

export interface FormDistributionScreenStoreProps {
  elements: IFormElement[];
  elementsCount: number;
  gdprDelegates: IGdprDelegate[];
  session?: AuthLoggedAccount;
}

export interface FormDistributionScreenDispatchProps {
  tryFetchDistributionResponses: (...args: Parameters<typeof fetchDistributionResponsesAction>) => Promise<IQuestionResponse[]>;
  tryFetchFormContent: (...args: Parameters<typeof fetchFormContentAction>) => Promise<IFormContent>;
  tryFetchGdprDelegates: (...args: Parameters<typeof fetchGdprDelegatesAction>) => Promise<IGdprDelegate[]>;
}

export type FormDistributionScreenPrivateProps = FormDistributionScreenProps &
  FormDistributionScreenStoreProps &
  FormDistributionScreenDispatchProps &
  NativeStackScreenProps<FormNavigationParams, typeof formRouteNames.distribution>;
