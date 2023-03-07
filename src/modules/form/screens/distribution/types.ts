import { NavigationInjectedProps } from 'react-navigation';
import { ThunkDispatch } from 'redux-thunk';

import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { IUserSession } from '~/framework/util/session';
import { DistributionStatus, IFormContent, IFormElement, IQuestionResponse } from '~/modules/form/reducer';

export interface IFormDistributionScreenDataProps {
  elements: IFormElement[];
  elementsCount: number;
  initialLoadingState: AsyncPagedLoadingState;
  session: IUserSession;
  structures: { label: string; value: string }[];
}

export interface IFormDistributionScreenEventProps {
  fetchDistributionResponses: (distributionId: number) => Promise<IQuestionResponse[]>;
  fetchFormContent: (formId: number) => Promise<IFormContent | undefined>;
  dispatch: ThunkDispatch<any, any, any>;
}

export interface IFormDistributionScreenNavigationParams {
  editable: boolean;
  formId: number;
  id: number;
  status: DistributionStatus;
  title: string;
}

export type IFormDistributionScreenProps = IFormDistributionScreenDataProps &
  IFormDistributionScreenEventProps &
  NavigationInjectedProps<IFormDistributionScreenNavigationParams>;
