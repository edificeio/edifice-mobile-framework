import { NavigationInjectedProps } from 'react-navigation';
import { ThunkDispatch } from 'redux-thunk';

import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { IUserSession } from '~/framework/util/session';
import { IDistribution, IForm } from '~/modules/form/reducer';

export type IFormDistributions = IForm & {
  distributions: IDistribution[];
};

export interface IFormDistributionListScreenDataProps {
  formDistributions: IFormDistributions[];
  initialLoadingState: AsyncPagedLoadingState;
  session: IUserSession;
}

export interface IFormDistributionListScreenEventProps {
  fetchDistributions: () => Promise<IDistribution[]>;
  fetchForms: () => Promise<IForm[]>;
  dispatch: ThunkDispatch<any, any, any>;
}

export type IFormDistributionListScreenProps = IFormDistributionListScreenDataProps &
  IFormDistributionListScreenEventProps &
  NavigationInjectedProps;
