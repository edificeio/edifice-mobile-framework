import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import { DistributionStatus, IFormContent, IFormElement, IQuestionResponse } from '~/framework/modules/form/model';
import { FormNavigationParams } from '~/framework/modules/form/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface FormDistributionScreenProps {
  elements: IFormElement[];
  elementsCount: number;
  initialLoadingState: AsyncPagedLoadingState;
  structures: { label: string; value: string }[];
  session?: ISession;
  fetchDistributionResponses: (distributionId: number) => Promise<IQuestionResponse[]>;
  fetchFormContent: (formId: number) => Promise<IFormContent>;
}

export interface FormDistributionScreenNavParams {
  editable: boolean;
  formId: number;
  id: number;
  status: DistributionStatus;
  title: string;
}

export interface FormDistributionScreenPrivateProps
  extends NativeStackScreenProps<FormNavigationParams, 'distribution'>,
    FormDistributionScreenProps {
  // @scaffolder add HOC props here
}
