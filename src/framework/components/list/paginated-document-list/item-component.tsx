import React from 'react';
import { ListRenderItemInfo, PixelRatio, TouchableOpacity, TouchableOpacityProps, View, ViewProps } from 'react-native';

import { PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { PaginatedFlashListProps, PaginatedFlatListProps } from '~/framework/components/list/paginated-list';
import { Picture, Svg } from '~/framework/components/picture';
import ImageWithFallback from '~/framework/components/picture/image-with-fallback';
import { CaptionText, HeadingSText, HeadingXXSText, SmallBoldText, TextSizeStyle } from '~/framework/components/text';
import { Media } from '~/framework/modules/media';
import { useMediaDisplay } from '~/framework/modules/media/hooks';
import { sessionImageSource } from '~/framework/util/transport';

import { DOCUMENT_SPACER_ITEM_DATA, FOLDER_SPACER_ITEM_DATA } from './component';
import styles from './styles';
import { DocumentItem, FolderItem, PaginatedDocumentFlashListProps, PaginatedDocumentFlatListProps } from './types';

export function DocumentListItemIcon({
  color,
  icon,
  size,
}: { size: 'large' | 'small' } & Pick<ReturnType<typeof useMediaDisplay>, 'color' | 'icon'>) {
  const iconSize = size === 'large' ? UI_SIZES.elements.icon.xxlarge : UI_SIZES.elements.icon.default;

  if (size === 'large') {
    return icon.type === 'Text' ? (
      <HeadingSText numberOfLines={1} style={{ color: color.regular }}>
        {icon.text}
      </HeadingSText>
    ) : icon.type === 'Image' ? (
      <View style={styles.documentLargeIconMediaWrapper}>
        <Picture {...icon} width={iconSize / 2} height={iconSize / 2} />
      </View>
    ) : (
      <View style={styles.documentLargeIconMediaWrapper}>
        <Picture {...icon} width={iconSize / 2} height={iconSize / 2} fill={color.regular} />
      </View>
    );
  } else /* size === 'small' */ {
    return icon.type === 'Text' ? (
      <HeadingXXSText numberOfLines={1} style={{ color: color.regular }}>
        {icon.text}
      </HeadingXXSText>
    ) : icon.type === 'Image' ? (
      <Picture {...icon} width={iconSize} height={iconSize} />
    ) : (
      <Picture {...icon} width={iconSize} height={iconSize} fill={color.regular} />
    );
  }
}

export function DocumentListItem<IdType, MediaT extends Media>({
  alwaysShowAppIcon,
  item,
  onPress,
  style,
  testID,
}: Readonly<
  Pick<
    Parameters<
      (PaginatedFlashListProps<DocumentItem<IdType, MediaT>> & PaginatedFlatListProps<DocumentItem<IdType, MediaT>>)['renderItem']
    >[0],
    'index' | 'item'
  >
> &
  Pick<TouchableOpacityProps, 'onPress' | 'style' | 'testID'> &
  Pick<PaginatedDocumentFlashListProps<IdType, MediaT> & PaginatedDocumentFlatListProps<IdType, MediaT>, 'alwaysShowAppIcon'>) {
  const WrapperComponent = onPress ? TouchableOpacity : View;
  const { color, icon, thumbnail } = useMediaDisplay(item);

  const thumbnailElement = React.useMemo(() => {
    if (thumbnail)
      return (
        <View style={styles.documentThumbnail}>
          <ImageWithFallback source={sessionImageSource(thumbnail)} style={styles.documentImage} />
          {alwaysShowAppIcon && (
            <View style={styles.documentThumbnailFloatingIconWrapper}>
              <DocumentListItemIcon color={color} size="small" icon={icon} />
            </View>
          )}
        </View>
      );
    return (
      <View style={[styles.documentThumbnail, { backgroundColor: color.pale }]}>
        <DocumentListItemIcon color={color} size="large" icon={icon} />
      </View>
    );
  }, [thumbnail, alwaysShowAppIcon, color, icon]);
  return (
    <WrapperComponent style={[styles.item, styles.itemDocument, style]} onPress={onPress} testID={testID}>
      {thumbnailElement}
      <View style={styles.documentMetadata}>
        <SmallBoldText style={styles.documentMetadataTitle} numberOfLines={1} testID="label-resource-name">
          {item.name ?? ''}
        </SmallBoldText>
        <CaptionText style={styles.documentMetadataDate} numberOfLines={1}>
          {item.date ? I18n.date(item.date) : ''}
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
    <WrapperComponent
      style={React.useMemo(() => [FolderListItem.wrapperComponentStyle, style], [style])}
      onPress={onPress}
      testID="button-folder">
      <Svg
        name="ui-folder"
        height={UI_SIZES.elements.icon.small}
        width={UI_SIZES.elements.icon.small}
        fill={theme.ui.text.regular}
      />
      <SmallBoldText style={UI_STYLES.flex1} numberOfLines={1} testID="label-folder-name">
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
