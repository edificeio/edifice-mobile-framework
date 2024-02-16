import { UserListProps } from '~/framework/components/list/user-horizontal/types';
import { DisplayUserPublicWithType } from '~/framework/modules/auth/model';

export type AccountSelectListContentContainerStyleProp = Omit<
  UserListProps<any>['contentContainerStyle'],
  | 'margin'
  | 'marginLeft'
  | 'marginRight'
  | 'marginStart'
  | 'marginEnd'
  | 'marginHorizontal'
  | 'padding'
  | 'paddingLeft'
  | 'paddingRight'
  | 'paddingStart'
  | 'paddingEnd'
  | 'paddingHorizontal'
  | 'gap'
  | 'rowGap'
  | 'columnGap'
> & {
  columnGap?: number;
  paddingHorizontal?: number;
};

export interface AccountSelectListProps<ItemT extends DisplayUserPublicWithType = DisplayUserPublicWithType>
  extends Omit<UserListProps<ItemT>, 'renderUserDetails' | 'contentContainerStyle'> {
  contentContainerStyle?: AccountSelectListContentContainerStyleProp;
}
