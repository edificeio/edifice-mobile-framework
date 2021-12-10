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
 * ResourceCard: Component that display a single resource/folder.
 *   props:
 *      - title + subtitle (+ textStyle) : Text displayed under the thumbnail
 *      - color (+ showBgColor)          : Color of the item, traditionally correspond to the entcore application. bgColor can be shown if no image, or with a transparent image.
 *      - image                          : Image thumbnail
 *      - overlay                        : Another component display on top of the image/background. Traditionally the icon of the entcore application
 *      - style                          : ViewStyle applied. Replaces entirely the default one. Use this if your style must be on a parent component to erase the default behaviour.
 */

import * as React from 'react';
import { Moment } from "moment";
import { ColorValue, FlatList, FlatListProps, Image, ImageSourcePropType, TextStyle, View, ViewStyle } from "react-native";
import styled from '@emotion/native';

import { Icon } from '~/framework/components/icon';
import { Text, TextBold, TextColorStyle, TextSizeStyle } from '~/framework/components/text';
import { displayPastDate } from '~/framework/util/date';
import theme from '~/app/theme';

export interface IExplorerProps extends Omit<FlatListProps<IExplorerFolderItem | IExplorerResourceItemWithImage | IExplorerResourceItemWithIcon | IExplorerEmptyItem>, 'data' | 'renderItem'> {
    onItemPress: (item: IExplorerFolderItem | IExplorerResourceItemWithImage | IExplorerResourceItemWithIcon) => void;
    folders?: Omit<IExplorerFolderItem, 'type'>[];
    resources?: Omit<IExplorerResourceItemWithImage | IExplorerResourceItemWithIcon, 'type'>[];
    data?: FlatListProps<IExplorerFolderItem | IExplorerResourceItemWithImage | IExplorerResourceItemWithIcon | IExplorerEmptyItem>['data']
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
    date: Moment;
}
export interface IExplorerResourceItemWithImage extends IExplorerResourceItemBase {
    thumbnail: ImageSourcePropType;
}
export interface IExplorerResourceItemWithIcon extends IExplorerResourceItemBase {
    icon: string;
}

export default (props: IExplorerProps) => {
    const { data, folders, resources, ...otherProps } = props;
    const explorerData: (IExplorerFolderItem | IExplorerResourceItemWithImage | IExplorerResourceItemWithIcon | IExplorerEmptyItem)[] = [
        ...(folders ?? []).map(f => ({ ...f, type: 'folder' } as IExplorerFolderItem)),
        ...(resources ?? []).map(f => ({ ...f, type: 'resource' } as IExplorerResourceItemWithImage | IExplorerResourceItemWithIcon)),
        ...data ?? [],
    ];
    if (explorerData.length % 2 !== 0) {
        explorerData.push({ type: 'empty' })
    }
    return <FlatList
        data={explorerData}
        numColumns={2}
        renderItem={({ item }) => renderItem(item, props.onItemPress)}
        columnWrapperStyle={{
            alignItems: 'stretch',
            justifyContent: 'space-around',
        }}
        style={{
            backgroundColor: theme.color.background.card,
            padding: 16,
        }}
        {...otherProps}
    />
};

const renderItem = (
    item: IExplorerFolderItem | IExplorerResourceItemWithImage | IExplorerResourceItemWithIcon | IExplorerEmptyItem,
    onItemPress: IExplorerProps['onItemPress']
) => {
    if (item.type === 'empty') return <EmptyItemTouchable><View /></EmptyItemTouchable>
    const TheRightTouchable = item.type === 'folder' ? FolderItemTouchable : ResourceItemTouchable;
    return <TheRightTouchable
        onPress={e => { onItemPress && onItemPress(item) }}
    >
        <ResourceCard
            title={(item as IExplorerFolderItem).name || (item as IExplorerResourceItemBase).title}
            subtitle={item.type === 'resource' ? displayPastDate(item.date) : undefined}
            color={item.type === 'folder' ? 'transparent' : item.color}
            showBgColor={item.type !== 'folder'}
            image={(item as IExplorerResourceItemWithImage).thumbnail}
            overlay={<Icon color={item.color} size={item.type === 'folder' ? 88 : 48} name={
                item.type === 'folder' ? 'folder1' : (item as IExplorerResourceItemWithIcon).icon}
            />}
            textStyle={item.type === 'folder' ? {textAlign: 'center'} : {}}
            style={{}} // reset default card styles because that's the touchable that hold them
        />
    </TheRightTouchable>
}

const commonItemTouchableStyle = {
    flex: 1,
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: 18,
};
export const resourceItemTouchableStyle = {
    ...commonItemTouchableStyle,
    borderWidth: 1,
    borderColor: theme.color.inputBorder
}
export const folderItemTouchableStyle = { ...commonItemTouchableStyle };
export const empyItemTouchableStyle = { ...commonItemTouchableStyle, opacity: 0 };
const ResourceItemTouchable = styled.TouchableOpacity(resourceItemTouchableStyle);
const FolderItemTouchable = styled.TouchableOpacity(folderItemTouchableStyle);
const EmptyItemTouchable = styled.TouchableOpacity(empyItemTouchableStyle);

const ThumbnailView = styled.View({
    height: 108,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
});
const MetadataView = styled.View({
    paddingVertical: 6,
    paddingHorizontal: 8
})

export const ResourceCard = (props: {
    title: string; subtitle?: string;
    textStyle?: TextStyle;
    color?: ColorValue;
    showBgColor?: boolean;
    image?: ImageSourcePropType;
    overlay?: React.ReactNode;
    style?: ViewStyle;
}) => <View style={props.style ?? resourceItemTouchableStyle} >
        <ThumbnailView>
            {props.showBgColor ? (() => {
                const CustomView = styled(ThumbnailView)({
                    backgroundColor: props.color, opacity: 0.1,
                    position: 'absolute', width: '100%', height: '100%'
                });
                return <CustomView/>
            })() : null}
            {props.image ? <Image source={props.image} style={{
                position: 'absolute', width: '100%', height: '100%',
                borderTopLeftRadius: 17,
                borderTopRightRadius: 17
            }} /> : null}
            {props.overlay ? props.overlay : null}
        </ThumbnailView>
        <MetadataView>
            <TextBold numberOfLines={1} style={{
                ...TextSizeStyle.Small,
                ...TextColorStyle.Light,
                ...props.textStyle
            }}>{props.title}</TextBold>
            <Text style={{
                ...TextSizeStyle.Small,
                ...TextColorStyle.Light,
                ...props.textStyle
            }}>{props.subtitle ?? null}</Text>
        </MetadataView>
    </View>
