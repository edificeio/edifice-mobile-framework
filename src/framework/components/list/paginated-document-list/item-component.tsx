import React from 'react';
import { ListRenderItemInfo, PixelRatio, TouchableOpacity, TouchableOpacityProps, View, ViewProps } from 'react-native';

import { PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import { DOCUMENT_SPACER_ITEM_DATA, FOLDER_SPACER_ITEM_DATA } from './documents-proxy';
import styles from './styles';
import {
  DocumentItem,
  DocumentItemWorkspace,
  DocumentItemWorkspaceDocumentMedia,
  FolderItem,
  PaginatedDocumentFlashListProps,
  PaginatedDocumentFlatListProps,
} from './types';

import { I18n } from '~/app/i18n';
import { EntAppNameOrSynonym, getEntAppName } from '~/app/intents';
import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { PaginatedFlashListProps, PaginatedFlatListProps } from '~/framework/components/list/paginated-list';
import { Picture, Svg } from '~/framework/components/picture';
import ImageWithFallback from '~/framework/components/picture/image-with-fallback';
import { CaptionText, HeadingSText, SmallBoldText, TextSizeStyle } from '~/framework/components/text';
import http from '~/framework/util/http';

const isItemWorkspaceResource = <AppTypes extends EntAppNameOrSynonym, IdType>(
  item: DocumentItem<AppTypes, IdType>,
): item is DocumentItemWorkspace<IdType> => item.appName === 'workspace';
const isItemWorkspaceDocumentMedia = <IdType,>(
  item: DocumentItemWorkspace<IdType>,
): item is DocumentItemWorkspaceDocumentMedia<IdType> => item.type === 'document';

export function DocumentListItemIcon<AppTypes extends EntAppNameOrSynonym, IdType>({
  item,
  size,
}: Readonly<
  Pick<
    Parameters<
      (PaginatedFlashListProps<DocumentItem<AppTypes, IdType>> &
        PaginatedFlatListProps<DocumentItem<AppTypes, IdType>>)['renderItem']
    >[0],
    'item'
  >
> & { size: 'large' | 'small' }) {
  const iconSize = size === 'large' ? UI_SIZES.elements.icon.xxlarge : UI_SIZES.elements.icon.default;
  if (isItemWorkspaceResource(item)) {
    const resourceIconPictureProps = {
      ...theme.media[item.type],
      fill: theme.apps[item.appName]?.accentColors.regular,
    };
    if (size === 'large') {
      return isItemWorkspaceDocumentMedia(item) && item.extension ? (
        <HeadingSText numberOfLines={1} style={{ color: theme.apps[item.appName]?.accentColors.regular }}>
          {item.extension.toLocaleUpperCase()}
        </HeadingSText>
      ) : (
        <View style={styles.documentLargeIconMediaWrapper}>
          <Picture {...resourceIconPictureProps} width={iconSize / 2} height={iconSize / 2} />
        </View>
      );
    } else {
      return <Picture {...resourceIconPictureProps} width={iconSize} height={iconSize} />;
    }
  } else {
    const resourceIconPictureProps = {
      ...theme.apps[getEntAppName(item.appName)]?.icon,
      ...(theme.apps[getEntAppName(item.appName)]?.icon.type === 'Svg'
        ? { fill: theme.apps[getEntAppName(item.appName)]?.accentColors.regular }
        : undefined),
    };
    return <Picture {...resourceIconPictureProps} width={iconSize} height={iconSize} />;
  }
}

export function DocumentListItem<AppTypes extends EntAppNameOrSynonym, IdType>({
  alwaysShowAppIcon,
  item,
  onPress,
  style,
  testID,
}: Readonly<
  Pick<
    Parameters<
      (PaginatedFlashListProps<DocumentItem<AppTypes, IdType>> &
        PaginatedFlatListProps<DocumentItem<AppTypes, IdType>>)['renderItem']
    >[0],
    'index' | 'item'
  >
> &
  Pick<TouchableOpacityProps, 'onPress' | 'style' | 'testID'> &
  Pick<PaginatedDocumentFlashListProps<AppTypes, IdType> & PaginatedDocumentFlatListProps<AppTypes, IdType>, 'alwaysShowAppIcon'>) {
  const WrapperComponent = onPress ? TouchableOpacity : View;

  const thumbnail = React.useMemo(
    () =>
      item.thumbnail ? (
        <View style={styles.documentThumbnail}>
          <ImageWithFallback {...http.imagePropsForSession({ source: { uri: item.thumbnail } })} style={styles.documentImage} />
          {alwaysShowAppIcon && (
            <View style={styles.documentThumbnailFloatingIconWrapper}>
              <DocumentListItemIcon size="small" item={item} />
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.documentThumbnail, { backgroundColor: theme.apps[getEntAppName(item.appName)]?.accentColors.pale }]}>
          <DocumentListItemIcon size="large" item={item} />
        </View>
      ),
    [alwaysShowAppIcon, item],
  );
  return (
    <WrapperComponent style={[styles.item, styles.itemDocument, style]} onPress={onPress} testID={testID}>
      {thumbnail}
      <View style={styles.documentMetadata}>
        <SmallBoldText style={styles.documentMetadataTitle} numberOfLines={1}>
          {item.title}
        </SmallBoldText>
        <CaptionText style={styles.documentMetadataDate} numberOfLines={1}>
          {I18n.date(item.date)}
        </CaptionText>
      </View>
    </WrapperComponent>
  );
}

export function FolderListItem<IdType>({
  item,
  onPress,
  style,
}: Readonly<
  Pick<
    Parameters<(PaginatedFlashListProps<FolderItem<IdType>> & PaginatedFlatListProps<FolderItem<IdType>>)['renderItem']>[0],
    'item' | 'index'
  >
> &
  Pick<TouchableOpacityProps, 'onPress'> &
  Pick<ViewProps, 'style'>) {
  const WrapperComponent = onPress ? TouchableOpacity : View;
  return (
    <WrapperComponent style={React.useMemo(() => [FolderListItem.wrapperComponentStyle, style], [style])} onPress={onPress}>
      <Svg
        name="ui-folder"
        height={UI_SIZES.elements.icon.small}
        width={UI_SIZES.elements.icon.small}
        fill={theme.ui.text.regular}
      />
      <SmallBoldText style={UI_STYLES.flex1} numberOfLines={1}>
        {item.title}
      </SmallBoldText>
    </WrapperComponent>
  );
}
FolderListItem.wrapperComponentStyle = [styles.item, styles.itemFolder];

export function FolderSpacerListItem({
  index,
  style,
}: Readonly<Pick<ListRenderItemInfo<typeof FOLDER_SPACER_ITEM_DATA>, 'index'> & Pick<ViewProps, 'style'>>) {
  return (
    <FolderListItem
      index={index}
      item={FolderSpacerListItem.dummyData}
      style={React.useMemo(() => [styles.itemSpacer, style], [style])}
    />
  );
}
FolderSpacerListItem.dummyData = { id: 0, title: ' ' };

export function DocumentSpacerListItem({
  style,
}: Readonly<Pick<ListRenderItemInfo<typeof DOCUMENT_SPACER_ITEM_DATA>, 'index'> & Pick<ViewProps, 'style'>>) {
  return <View style={[styles.item, styles.itemSpacer, style]} />;
}

export function DocumentPlaceholderItem({ style }: Pick<ViewProps, 'style'>) {
  return (
    <View style={React.useMemo(() => [styles.item, styles.itemDocument, style], [style])}>
      <PlaceholderMedia style={styles.documentThumbnailPlaceholder} isRound={false} />
      <View style={styles.documentMetadata}>
        <PlaceholderLine
          height={TextSizeStyle.Medium.fontSize}
          noMargin
          style={{
            marginBottom: (PixelRatio.getFontScale() * (TextSizeStyle.Medium.lineHeight - TextSizeStyle.Medium.fontSize)) / 2,
            marginTop: (PixelRatio.getFontScale() * (TextSizeStyle.Medium.lineHeight - TextSizeStyle.Medium.fontSize)) / 2,
          }}
        />
        <PlaceholderLine
          height={TextSizeStyle.Small.fontSize}
          width={80}
          noMargin
          style={{
            marginBottom: (PixelRatio.getFontScale() * (TextSizeStyle.Small.lineHeight - TextSizeStyle.Small.fontSize)) / 2,
            marginTop: (PixelRatio.getFontScale() * (TextSizeStyle.Small.lineHeight - TextSizeStyle.Small.fontSize)) / 2,
          }}
        />
      </View>
    </View>
  );
}
