import * as React from 'react';
import { PixelRatio, TouchableOpacity, View } from 'react-native';

import { ListRenderItem } from '@shopify/flash-list';
import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';
import { ResourceGrid } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import ModuleImage from '~/framework/components/picture/module-image';
import { CaptionText, SmallBoldText, TextSizeStyle } from '~/framework/components/text';
import { explorerItemIsFolder, explorerItemIsLoading } from '~/framework/modules/explorer/model';
import { EMPTY_FOLDER_ITEM_NAME } from '~/framework/modules/explorer/store';

export const estimatedItemSize = 200; // Measured estimated height of an item from the react-native inspector. @see https://shopify.github.io/flash-list/docs/estimated-item-size

const thumbnailSize = `${150 * PixelRatio.get()}x0`;

const resourceExplorerResourceItemStyle = [styles.item, styles.resourceItem];
export const ResourceExplorerResourceItem: React.FC<ResourceGrid.ResourceExplorerResourceItemProps> = ({
  item,
  moduleConfig,
  onPressResource,
}) => {
  return (
    <TouchableOpacity
      style={resourceExplorerResourceItemStyle}
      onPress={React.useCallback(() => onPressResource?.(item), [item, onPressResource])}>
      <ModuleImage
        moduleConfig={moduleConfig}
        style={styles.itemThumbnail}
        source={React.useMemo(() => (item.thumbnail ? { uri: item.thumbnail } : undefined), [item.thumbnail])}
        iconSize={UI_SIZES.elements.icon.xxlarge}
        thumbnail={thumbnailSize}
      />
      <View style={styles.labelContainer}>
        <SmallBoldText style={styles.labelCaption} numberOfLines={1}>
          {item.name}
        </SmallBoldText>
        <CaptionText style={styles.labelCaption} numberOfLines={1}>
          {I18n.date(item.updatedAt)}
        </CaptionText>
      </View>
    </TouchableOpacity>
  );
};

export const ResourceExplorerFolderItem: React.FC<ResourceGrid.ResourceExplorerFolderItemProps> = ({ item, onPressFolder }) => {
  const isSpacerFolder = item.name === EMPTY_FOLDER_ITEM_NAME;

  const resourceExplorerFolderItemStyle = React.useMemo(() => {
    return isSpacerFolder ? [styles.item, styles.folderItem, styles.spacerFolder] : [styles.item, styles.folderItem];
  }, [isSpacerFolder]);

  return (
    <TouchableOpacity
      disabled={isSpacerFolder}
      onPress={React.useCallback(() => onPressFolder?.(item), [item, onPressFolder])}
      style={resourceExplorerFolderItemStyle}>
      <View style={styles.folderThumbnail}>
        <Svg
          name="ui-folder"
          fill={theme.palette.grey.black}
          width={UI_SIZES.elements.icon.small}
          height={UI_SIZES.elements.icon.small}
        />
        <View style={styles.folderLabelContainer}>
          <SmallBoldText numberOfLines={1} style={styles.folderLabel}>
            {item.name}
          </SmallBoldText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const ResourceExplorerLoadingItem: ListRenderItem<null> = () => {
  return (
    <View style={resourceExplorerResourceItemStyle}>
      <Placeholder Animation={Fade}>
        <PlaceholderMedia style={styles.itemThumbnailPlaceholder} />
        <View style={styles.labelContainerPlaceholder}>
          <PlaceholderLine height={TextSizeStyle.Medium.fontSize} noMargin />
          <PlaceholderLine height={TextSizeStyle.Small.fontSize} width={80} noMargin />
        </View>
      </Placeholder>
    </View>
  );
};

export const ResourceExplorerItem = ({
  index,
  item,
  onPressFolder,
  onPressResource,
  ...info
}: ResourceGrid.ResourceExplorerItemProps) => {
  return explorerItemIsLoading(item) ? (
    <ResourceExplorerLoadingItem item={item} index={index} {...info} />
  ) : explorerItemIsFolder(item) ? (
    <ResourceExplorerFolderItem item={item} index={index} onPressFolder={onPressFolder} {...info} />
  ) : (
    <ResourceExplorerResourceItem item={item} index={index} onPressResource={onPressResource} {...info} />
  );
};
