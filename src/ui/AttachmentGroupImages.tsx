import * as React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ILocalAttachment } from './Attachment';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import { openCarousel } from '~/framework/components/carousel/openCarousel';
import { UI_SIZES } from '~/framework/components/constants';
import { cameraActionFm } from '~/framework/components/menus/actions/cameraAction';
import { galleryActionFm } from '~/framework/components/menus/actions/galleryAction';
import BottomMenu from '~/framework/components/menus/bottom';
import { Picture } from '~/framework/components/picture';
import { BodyBoldText, TextSizeStyle } from '~/framework/components/text';
import { LocalFile } from '~/framework/util/fileHandler/models';
import { mapLocalFileToLegacy } from '~/framework/util/fileHandler/utils/mapLocalFileToLegacy';
import { formatSource, Image } from '~/framework/util/media-deprecated';
import { isEmpty } from '~/framework/util/object';
import { Trackers } from '~/framework/util/tracker';

const itemWidth =
  // The items' width is computed by substracting spacings from the screen's width
  (UI_SIZES.screen.width -
    // horizontal padding of page
    2 * UI_SIZES.spacing.medium -
    // horizontal padding of items' container
    2 * UI_SIZES.spacing.big -
    // space between items
    2 * UI_SIZES.spacing.big -
    // vertical border width of "attach photos" button
    2 * UI_SIZES.border.thin) /
  3;

const styles = StyleSheet.create({
  attachPhotos: { color: theme.palette.primary.regular, marginTop: UI_SIZES.spacing.small, textAlign: 'center' },
  attachPhotosAdded: { ...TextSizeStyle.Small, marginTop: UI_SIZES.spacing.tiny },
  attachPhotosContainer: { alignItems: 'center', justifyContent: 'center' },
  attachPhotosContainerAdded: {
    aspectRatio: UI_SIZES.aspectRatios.square,
    borderColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    width: itemWidth,
  },
  container: {
    borderColor: theme.ui.border.input,
    borderRadius: UI_SIZES.radius.selector,
    borderWidth: UI_SIZES.border.thin,
  },
  containerAdded: { borderColor: theme.palette.grey.stone },
  contentContainer: {
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: UI_SIZES.spacing.medium,
  },
  contentContainerAdded: {
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.huge,
    height: UI_SIZES.dimensions.height.large,
    position: 'absolute',
    right: -UI_SIZES.spacing._LEGACY_small,
    top: -UI_SIZES.spacing.minor,
    width: UI_SIZES.dimensions.height.large,
  },
  itemSeperator: { paddingVertical: UI_SIZES.spacing.small },
  photo: {
    aspectRatio: UI_SIZES.aspectRatios.square,
    borderRadius: UI_SIZES.radius.medium,
    width: itemWidth,
  },
  photoContainer: { borderRadius: UI_SIZES.radius.medium, marginRight: UI_SIZES.spacing.big },
});

export class AttachmentGroupImages extends React.PureComponent<{
  onAdd: (attachments: ILocalAttachment[]) => void;
  onRemove: (index: number) => void;
  images: ILocalAttachment[];
  moduleName: string;
}> {
  imagesAdded() {
    return this.props.images.length > 0;
  }

  onOpenImage = () => {
    const { images, moduleName } = this.props;
    const carouselImages = images.map(image => ({
      alt: 'image',
      src: { uri: image.uri },
      type: 'image' as const,
    }));
    Trackers.trackEvent(moduleName, 'OPEN ATTACHMENT', 'Edit mode');
    openCarousel({ data: carouselImages, referer: undefined });
  };

  renderItemSeparator = () => <View style={styles.itemSeperator} />;

  AddPhotosButton = () => {
    const { onAdd } = this.props;

    return (
      <BottomMenu
        actions={[
          cameraActionFm('homework', 'attachments', {
            callback: files => onAdd((files as LocalFile[]).map(mapLocalFileToLegacy)),
          }),
          galleryActionFm('homework', 'attachments', {
            callback: files => onAdd((files as LocalFile[]).map(mapLocalFileToLegacy)),
          }),
        ]}>
        <View style={[styles.attachPhotosContainer, this.imagesAdded() && styles.attachPhotosContainerAdded]}>
          <Picture
            type="Svg"
            name={this.imagesAdded() ? 'ui-plus' : 'ui-camera'}
            width={UI_SIZES.dimensions.width[this.imagesAdded() ? 'medium' : 'hug']}
            height={UI_SIZES.dimensions.height[this.imagesAdded() ? 'medium' : 'hug']}
            fill={theme.palette.primary.regular}
          />
          <BodyBoldText style={[styles.attachPhotos, this.imagesAdded() && styles.attachPhotosAdded]}>
            {I18n.get('photospicker-addphotos')}
          </BodyBoldText>
        </View>
      </BottomMenu>
    );
  };

  renderItem = ({ index, item }) => {
    const { onRemove } = this.props;
    if (isEmpty(item)) return this.AddPhotosButton();

    return (
      <View style={styles.photoContainer}>
        <TouchableOpacity onPress={this.onOpenImage}>
          <Image style={styles.photo} resizeMode="cover" source={formatSource(item.uri)} onError={() => onRemove(index)} />
        </TouchableOpacity>

        <IconButton
          icon="ui-close"
          style={styles.iconButton}
          size={UI_SIZES.dimensions.height.smallPlus}
          color={theme.palette.grey.white}
          action={() => onRemove(index)}
        />
      </View>
    );
  };

  render() {
    const { images } = this.props;

    return (
      <FlatList
        data={[...images, {}]}
        numColumns={3}
        scrollEnabled={false}
        style={[styles.container, this.imagesAdded() && styles.containerAdded]}
        contentContainerStyle={[styles.contentContainer, !this.imagesAdded() && styles.contentContainerAdded]}
        ItemSeparatorComponent={this.renderItemSeparator}
        renderItem={this.renderItem}
      />
    );
  }
}
