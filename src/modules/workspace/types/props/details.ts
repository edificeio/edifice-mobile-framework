import { ThunkDispatch } from 'redux-thunk';

import { INavigationProps } from '~/modules/workspace/types/index';
import { IEventProps } from '~/types';

import { IActionProps } from './actions';

export type IDetailsProps = IActionProps &
  IEventProps &
  INavigationProps & {
    dispatch: ThunkDispatch<any, any, any>;
  };
