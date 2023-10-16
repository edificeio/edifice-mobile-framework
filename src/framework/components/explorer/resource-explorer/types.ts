import { Moment } from 'moment';
import * as React from 'react';
import { ColorValue, FlatListProps, ImageSourcePropType, TextProps, TextStyle, ViewStyle } from 'react-native';

import { PictureProps } from '~/framework/components/picture';

export interface ResourceExplorerItem {
  color: ColorValue;
}

export interface ResourceExplorerEmptyItem {
  type: 'empty';
}

export interface ResourceExplorerFolderItem extends ResourceExplorerItem {
  type: 'folder';
  name: string;
}

export interface ResourceExplorerItemBase extends ResourceExplorerItem {
  type: 'resource';
  title: string;
  date?: Moment;
}
export interface ResourceExplorerItemWithImage extends ResourceExplorerItemBase {
  thumbnail: ImageSourcePropType;
}
export interface ResourceExplorerItemWithIcon extends ResourceExplorerItemBase {
  icon: string | PictureProps;
}

export interface ResourceExplorerProps<FolderType extends object, ResourceType extends object>
  extends Omit<
    FlatListProps<
      | (ResourceExplorerFolderItem & FolderType)
      | (ResourceExplorerItemWithImage & ResourceType)
      | (ResourceExplorerItemWithIcon & ResourceType)
      | ResourceExplorerEmptyItem
    >,
    'data' | 'renderItem' | 'keyExtractor'
  > {
  onItemPress: (
    item:
      | (ResourceExplorerFolderItem & FolderType)
      | (ResourceExplorerItemWithImage & ResourceType)
      | (ResourceExplorerItemWithIcon & ResourceType),
  ) => void;
  folders?: (Omit<ResourceExplorerFolderItem, 'type'> & FolderType)[];
  resources?: (Omit<ResourceExplorerItemWithImage | ResourceExplorerItemWithIcon, 'type'> & ResourceType)[];
  data?: FlatListProps<
    | (ResourceExplorerFolderItem & FolderType)
    | (ResourceExplorerItemWithImage & ResourceType)
    | (ResourceExplorerItemWithIcon & ResourceType)
    | ResourceExplorerEmptyItem
  >['data'];
  keyExtractor?: FlatListProps<
    | (ResourceExplorerFolderItem & FolderType)
    | (ResourceExplorerItemWithImage & ResourceType)
    | (ResourceExplorerItemWithIcon & ResourceType)
  >['keyExtractor'];
}

export interface ResourceExplorerItemProps {
  title: string;
  subtitle?: string;
  textStyle?: TextStyle;
  textProps?: Omit<TextProps, 'style'>;
  color?: ColorValue;
  showBgColor?: boolean;
  base?: React.ReactNode;
  image?: ImageSourcePropType;
  style?: ViewStyle;
}
