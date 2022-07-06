import { NavigationInjectedProps } from 'react-navigation';

import { IItem } from '~/modules/workspace/types/states';
import { IEventProps } from '~/types';

import { IActionProps } from './actions';

export interface IDataItemsProps {
  files: {
    [key: string]: IItem;
  };
  isFetching: boolean;
}

export type IItemsProps = IActionProps & IEventProps & NavigationInjectedProps & IDataItemsProps;
