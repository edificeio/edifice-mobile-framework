import { IEventProps } from '~/types';
import { INavigationProps } from '~/workspace/types/index';
import { IItem } from '~/workspace/types/states';

import { IActionProps } from './actions';

export interface IDataItemsProps {
  items: {
    [key: string]: IItem;
  };
  isFetching: boolean;
}

export type IItemsProps = IActionProps & IEventProps & INavigationProps & IDataItemsProps;
