import { INavigationProps } from '~/modules/workspace/types/index';
import { IItem } from '~/modules/workspace/types/states';
import { IEventProps } from '~/types';

import { IActionProps } from './actions';

export interface IDataItemsProps {
  items: {
    [key: string]: IItem;
  };
  isFetching: boolean;
}

export type IItemsProps = IActionProps & IEventProps & INavigationProps & IDataItemsProps;
