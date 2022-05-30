/**
 * Components for resource explorer
 *
 * default: Resource Explorer
 *   props :
 *      - Same as FlatList
 *      - resources
 *      - [folders]
 *      - [data]
 * Display a two-colums list of given resources and folders. All data passed with resources, folders and data props are merged.
 * Elements are displayed in that order : folders - resources - aditional data. For now, there is no option to sort them mixed up.
 * You have to sort elements by yourself before passing them with the `data` prop.
 *
 *
 * ResourceItem: Component that display a single resource/folder.
 *   props:
 *      - title + subtitle (+ textStyle) : Text displayed under the thumbnail
 *      - color (+ showBgColor)          : Color of the item, traditionally correspond to the entcore application. bgColor can be shown if no image, or with a transparent image.
 *      - image                          : Image thumbnail
 *      - overlay                        : Another component display on top of the image/background. Traditionally the icon of the entcore application
 *      - style                          : ViewStyle applied. Replaces entirely the default one. Use this if your style must be on a parent component to erase the default behaviour.
 */
import styled from '@emotion/native';
import { Moment } from 'moment';
import * as React from 'react';
import {
  ColorValue,
  FlatList,
  FlatListProps,
  Image,
  ImageSourcePropType,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/icon';
import { Text, TextBold, TextColorStyle, TextSizeStyle } from '~/framework/components/text';
import { displayPastDate } from '~/framework/util/date';

import { UI_SIZES } from './constants';

export interface IExplorerProps<FolderType extends {}, ResourceType extends {}>
  extends Omit<
    FlatListProps<
      | (IExplorerFolderItem & FolderType)
      | (IExplorerResourceItemWithImage & ResourceType)
      | (IExplorerResourceItemWithIcon & ResourceType)
      | IExplorerEmptyItem
    >,
    'data' | 'renderItem' | 'keyExtractor'
  > {
  onItemPress: (
    item:
      | (IExplorerFolderItem & FolderType)
      | (IExplorerResourceItemWithImage & ResourceType)
      | (IExplorerResourceItemWithIcon & ResourceType),
  ) => void;
  folders?: (Omit<IExplorerFolderItem, 'type'> & FolderType)[];
  resources?: (Omit<IExplorerResourceItemWithImage | IExplorerResourceItemWithIcon, 'type'> & ResourceType)[];
  data?: FlatListProps<
    | (IExplorerFolderItem & FolderType)
    | (IExplorerResourceItemWithImage & ResourceType)
    | (IExplorerResourceItemWithIcon & ResourceType)
    | IExplorerEmptyItem
  >['data'];
  keyExtractor?: FlatListProps<
    | (IExplorerFolderItem & FolderType)
    | (IExplorerResourceItemWithImage & ResourceType)
    | (IExplorerResourceItemWithIcon & ResourceType)
  >['keyExtractor'];
}

export interface IExplorerItem {
  // id: string;
  color: ColorValue;
}

export interface IExplorerEmptyItem {
  type: 'empty';
}

export interface IExplorerFolderItem extends IExplorerItem {
  type: 'folder';
  name: string;
}

interface IExplorerResourceItemBase extends IExplorerItem {
  type: 'resource';
  title: string;
  date?: Moment;
}
export interface IExplorerResourceItemWithImage extends IExplorerResourceItemBase {
  thumbnail: ImageSourcePropType;
}
export interface IExplorerResourceItemWithIcon extends IExplorerResourceItemBase {
  icon: string;
}

export default <FolderType extends {}, ResourceType extends {}>(props: IExplorerProps<FolderType, ResourceType>) => {
  const { data, folders, resources, keyExtractor, contentContainerStyle, ...otherProps } = props;
  const explorerData: (
    | (IExplorerFolderItem & FolderType)
    | (IExplorerResourceItemWithImage & ResourceType)
    | (IExplorerResourceItemWithIcon & ResourceType)
    | IExplorerEmptyItem
  )[] = [
    ...(folders ?? []).map(f => ({ ...f, type: 'folder' } as IExplorerFolderItem & FolderType)),
    ...(resources ?? []).map(
      f =>
        ({ ...f, type: 'resource' } as
          | (IExplorerResourceItemWithImage & ResourceType)
          | (IExplorerResourceItemWithIcon & ResourceType)),
    ),
    ...(data ?? []),
  ];
  if (explorerData.length % 2 !== 0) {
    explorerData.push({ type: 'empty' });
  }
  return (
    <FlatList
      data={explorerData}
      numColumns={2}
      renderItem={({ item }) => renderItem(item, props.onItemPress)}
      scrollIndicatorInsets={{ right: 0.001 }} // 🍎 Hack to guarantee scrollbar to be stick on the right edge of the screen.
      columnWrapperStyle={{
        alignItems: 'stretch',
        justifyContent: 'space-around',
      }}
      contentContainerStyle={[
        explorerData.length === 0
          ? {}
          : {
              backgroundColor: theme.ui.background.card,
              padding: 16,
            },
        contentContainerStyle,
      ]}
      {...(keyExtractor
        ? {
            keyExtractor: (item, index) => (item.type === 'empty' ? item.type : keyExtractor(item, index)),
          }
        : {})}
      {...otherProps}
    />
  );
};

const renderItem = <FolderType extends {}, ResourceType extends {}>(
  item:
    | (IExplorerFolderItem & FolderType)
    | (IExplorerResourceItemWithImage & ResourceType)
    | (IExplorerResourceItemWithIcon & ResourceType)
    | IExplorerEmptyItem,
  onItemPress: IExplorerProps<FolderType, ResourceType>['onItemPress'],
) => {
  if (item.type === 'empty')
    return (
      <EmptyItemTouchable>
        <View />
      </EmptyItemTouchable>
    );
  const TheRightTouchable = item.type === 'folder' ? FolderItemTouchable : ResourceItemTouchable;
  // "isResourceWithDate" is used to adjust the text layout:
  // -a resource with a date has a date subtitle (so the title/subtitle are not centered and use 1 line max)
  // -a folder or a resource without a date have no subtitle (so the title is centered and use 2 lines max)
  const isResourceWithDate = item.type === 'resource' && item.date;
  return (
    <TheRightTouchable
      onPress={e => {
        onItemPress && onItemPress(item);
      }}>
      <ResourceItem
        title={(item as IExplorerFolderItem).name || (item as IExplorerResourceItemBase).title}
        subtitle={isResourceWithDate ? displayPastDate(item.date!) : undefined}
        color={item.type === 'folder' ? 'transparent' : item.color}
        showBgColor={item.type !== 'folder'}
        image={(item as IExplorerResourceItemWithImage).thumbnail}
        overlay={
          <Icon
            color={item.color}
            size={item.type === 'folder' ? 88 : 48}
            name={item.type === 'folder' ? 'folder1' : (item as IExplorerResourceItemWithIcon).icon}
          />
        }
        textStyle={isResourceWithDate ? {} : { textAlign: 'center' }}
        textProps={{ numberOfLines: isResourceWithDate ? 1 : 2 }}
        style={{}} // reset default card styles because that's the touchable that hold them
      />
    </TheRightTouchable>
  );
};

const commonItemTouchableStyle = {
  flex: 1,
  marginHorizontal: 12,
  marginVertical: 10,
  borderRadius: 18,
};
export const resourceItemTouchableStyle = {
  ...commonItemTouchableStyle,
  borderWidth: 1,
  borderColor: theme.ui.border.input,
};
export const folderItemTouchableStyle = { ...commonItemTouchableStyle };
export const empyItemTouchableStyle = { ...commonItemTouchableStyle, opacity: 0 };
const ResourceItemTouchable = styled.TouchableOpacity(resourceItemTouchableStyle);
const FolderItemTouchable = styled.TouchableOpacity(folderItemTouchableStyle);
const EmptyItemTouchable = styled.TouchableOpacity(empyItemTouchableStyle);

const ThumbnailView = styled.View({
  aspectRatio: UI_SIZES.aspectRatios.thumbnail,
  justifyContent: 'center',
  alignItems: 'center',
  borderTopLeftRadius: 17,
  borderTopRightRadius: 17,
});
const MetadataView = styled.View({
  paddingVertical: 6,
  paddingHorizontal: 8,
});

export const ResourceItem = (props: {
  title: string;
  subtitle?: string;
  textStyle?: TextStyle;
  textProps?: Omit<TextProps, 'style'>;
  color?: ColorValue;
  showBgColor?: boolean;
  image?: ImageSourcePropType;
  overlay?: React.ReactNode;
  style?: ViewStyle;
}) => {
  return (
    <View style={props.style ?? resourceItemTouchableStyle}>
      <ThumbnailView>
        {props.showBgColor
          ? (() => {
              const CustomView = styled(ThumbnailView)({
                backgroundColor: props.color,
                opacity: 0.1,
                position: 'absolute',
                width: '100%',
                height: '100%',
              });
              return <CustomView />;
            })()
          : null}
        {props.image ? (
          <Image
            source={props.image}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderTopLeftRadius: 17,
              borderTopRightRadius: 17,
            }}
          />
        ) : null}
        {props.overlay ? props.overlay : null}
      </ThumbnailView>
      <MetadataView>
        <View style={{}}>
          {/* a resource item always has available space for 2 text lines,
          so we generate it and place the title/subtitle on top (as an absolute position) */}
          <Text> </Text>
          <Text> </Text>
          <View style={{ position: 'absolute', width: '100%' }}>
            <TextBold
              numberOfLines={props.textProps?.numberOfLines}
              {...props.textProps}
              style={{
                ...TextSizeStyle.Small,
                ...TextColorStyle.Light,
                ...props.textStyle,
              }}>
              {props.title ?? null}
            </TextBold>
          </View>
          {props.subtitle ? (
            <View style={{ position: 'absolute', width: '100%' }}>
              <Text> </Text>
              <Text
                numberOfLines={props.textProps?.numberOfLines}
                style={{
                  ...TextSizeStyle.Small,
                  ...TextColorStyle.Light,
                  ...props.textStyle,
                }}>
                {props.subtitle}
              </Text>
            </View>
          ) : null}
        </View>
      </MetadataView>
    </View>
  );
};
