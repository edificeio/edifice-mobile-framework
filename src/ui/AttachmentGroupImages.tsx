import * as React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { openCarousel } from '~/framework/components/carousel/openCarousel';
import { UI_SIZES } from '~/framework/components/constants';
import { Image, formatSource } from '~/framework/util/media';
import { Trackers } from '~/framework/util/tracker';
import { ContentUri } from '~/types/contentUri';

import CloseButton from '~/framework/components/buttons/close';
import BottomMenu from '~/framework/components/menus/bottom';
import { cameraAction, galleryAction } from '~/framework/components/menus/actions';
import { Picture } from '~/framework/components/picture';
import { BodyBoldText, TextSizeStyle } from '~/framework/components/text';
import { I18n } from '~/app/i18n';
import { isEmpty } from '~/framework/util/object';

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
    borderColor: theme.palette.primary.regular,
    borderWidth: UI_SIZES.border.thin,
    borderRadius: UI_SIZES.radius.medium,
    width: itemWidth,
    aspectRatio: 1,
  },
  closeButton: {
    backgroundColor: theme.palette.primary.regular,
    width: UI_SIZES.dimensions.height.large,
    height: UI_SIZES.dimensions.height.large,
    position: 'absolute',
    elevation: 10,
    right: -6,
    top: -8,
  },
  container: {
    borderColor: theme.ui.border.input,
    borderWidth: UI_SIZES.border.thin,
    borderRadius: UI_SIZES.radius.selector,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: UI_SIZES.spacing.medium,
  },
  itemSeperator: { paddingVertical: UI_SIZES.spacing.small },
  photo: {
    width: itemWidth,
    aspectRatio: 1,
    borderRadius: UI_SIZES.radius.medium,
  },
  photoContainer: { marginRight: UI_SIZES.spacing.big, borderRadius: UI_SIZES.radius.medium },
});

class AttachmentGroupImagesNoNav extends React.PureComponent<{
  attachments: ContentUri[];
  imageCallback: any;
  onRemove: (index: number) => void;
}> {
  public render() {
    const { attachments, onRemove, imageCallback } = this.props;
    const carouselImages = attachments.map(att => ({ src: { uri: att.uri }, alt: 'image' }));
    const imagesAdded = attachments.length > 0;
    const numColumns = 3;

    const AddPhotosButton = () => {
      return (
        <BottomMenu
          actions={[cameraAction({ callback: imageCallback }), galleryAction({ callback: imageCallback, multiple: true })]}>
          <View style={[styles.attachPhotosContainer, imagesAdded && styles.attachPhotosContainerAdded]}>
            <Picture
              type="NamedSvg"
              name={imagesAdded ? 'ui-plus' : 'ui-camera'}
              width={UI_SIZES.dimensions.width[imagesAdded ? 'medium' : 'hug']}
              height={UI_SIZES.dimensions.height[imagesAdded ? 'medium' : 'hug']}
              fill={theme.palette.primary.regular}
            />
            <BodyBoldText style={[styles.attachPhotos, imagesAdded && styles.attachPhotosAdded]}>
              {I18n.get('photospicker-addphotos')}
            </BodyBoldText>
          </View>
        </BottomMenu>
      );
    };

    return imagesAdded ? (
      <FlatList
        data={[...attachments, {}]}
        numColumns={numColumns}
        scrollEnabled={false}
        style={styles.container}
        ItemSeparatorComponent={() => <View style={styles.itemSeperator} />}
        renderItem={({ item, index }) => {
          if (isEmpty(item)) return <AddPhotosButton />;
          return (
            <View style={styles.photoContainer}>
              <TouchableOpacity
                onPress={() => {
                  openCarousel({
                    data: carouselImages.map(img => ({
                      type: 'image' as 'image',
                      src: img.src,
                      ...(img.alt ? { alt: img.alt } : undefined),
                    })),
                  });
                  Trackers.trackEvent('Post creation', 'OPEN ATTACHMENT', 'Edit mode');
                  //FIXME: ugly code here  (module name (1st argument) must be obtained dynamically)
                }}>
                <Image style={styles.photo} source={formatSource(item.uri)} resizeMode="cover" />
              </TouchableOpacity>
              <CloseButton
                style={styles.closeButton}
                size={UI_SIZES.dimensions.height.smallPlus}
                pictureFill={theme.palette.grey.white}
                action={() => onRemove(index)}
              />
            </View>
          );
        }}
      />
    ) : (
      <View style={styles.container}>
        <AddPhotosButton />
      </View>
    );
  }
}
export const AttachmentGroupImages = AttachmentGroupImagesNoNav;
