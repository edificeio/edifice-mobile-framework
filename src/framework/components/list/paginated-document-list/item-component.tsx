import React from 'react';
import { PixelRatio, TouchableOpacity, TouchableOpacityProps, View, ViewProps } from 'react-native';

import { PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import { FOLDER_SPACER_ITEM_DATA } from './documents-proxy';
import styles from './styles';
import { DocumentItem, DocumentItemWorkspace, DocumentItemWorkspaceDocumentMedia, FolderItem } from './types';
import ImageWithFallback from '../../picture/image-with-fallback';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { PaginatedListProps } from '~/framework/components/list/paginated-list';
import { Picture, Svg } from '~/framework/components/picture';
import { CaptionText, HeadingSText, SmallBoldText, TextSizeStyle } from '~/framework/components/text';
import http from '~/framework/util/http';

const isItemWorkspaceResource = (item: DocumentItem): item is DocumentItemWorkspace => item.appName === 'workspace';
const isItemWorkspaceDocumentMedia = (item: DocumentItemWorkspace): item is DocumentItemWorkspaceDocumentMedia =>
  item.type === 'document';

export function DocumentListItemIcon({
  item,
  size,
}: Readonly<Pick<Parameters<PaginatedListProps<DocumentItem>['renderItem']>[0], 'item'>> & { size: 'large' | 'small' }) {
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
      ...theme.apps[item.appName]?.icon,
      ...(theme.apps[item.appName]?.icon.type === 'Svg' ? { fill: theme.apps[item.appName]?.accentColors.regular } : undefined),
    };
    return <Picture {...resourceIconPictureProps} width={iconSize} height={iconSize} />;
  }
}

export function DocumentListItem({
  item,
  onPress,
}: Readonly<Pick<Parameters<PaginatedListProps<DocumentItem>['renderItem']>[0], 'index' | 'item'>> &
  Pick<TouchableOpacityProps, 'onPress'>) {
  const WrapperComponent = onPress ? TouchableOpacity : View;

  const thumbnail = React.useMemo(
    () =>
      item.thumbnail ? (
        <View style={styles.documentThumbnail}>
          <ImageWithFallback {...http.imagePropsForSession({ source: { uri: item.thumbnail } })} style={styles.documentImage} />
          <View style={styles.documentThumbnailFloatingIconWrapper}>
            <DocumentListItemIcon size="small" item={item} />
          </View>
        </View>
      ) : (
        <View style={[styles.documentThumbnail, { backgroundColor: theme.apps[item.appName]?.accentColors.pale }]}>
          <DocumentListItemIcon size="large" item={item} />
        </View>
      ),
    [item],
  );
  return (
    <WrapperComponent style={[styles.item, styles.itemDocument]} onPress={onPress}>
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

export function FolderListItem({
  item,
  onPress,
  style,
}: Readonly<Pick<Parameters<PaginatedListProps<FolderItem>['renderItem']>[0], 'item' | 'index'>> &
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
      <SmallBoldText numberOfLines={1}>{item.title}</SmallBoldText>
    </WrapperComponent>
  );
}
FolderListItem.wrapperComponentStyle = [styles.item, styles.itemFolder];

export function FolderSpacerListItem({
  index,
}: Readonly<Parameters<PaginatedListProps<typeof FOLDER_SPACER_ITEM_DATA>['renderItem']>[0]>) {
  return <FolderListItem index={index} item={FolderSpacerListItem.dummyData} style={styles.itemSpacer} />;
}
FolderSpacerListItem.dummyData = { id: 0, title: ' ' };

export const renderPlacerholderItem = () => {
  return (
    <View style={[styles.item, styles.itemDocument]}>
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
};
