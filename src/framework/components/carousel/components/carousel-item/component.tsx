import * as React from 'react';
import { ImageURISource } from 'react-native';

import ImageItem from '~/framework/components/carousel/components/items/image-item/component';
import PdfItem from '~/framework/components/carousel/components/items/pdf-item/component';
import PlayerItem from '~/framework/components/carousel/components/items/player-item/component';
import UnknownItem from '~/framework/components/carousel/components/items/unknown-item/component';
import UnviewableItem from '~/framework/components/carousel/components/items/unviewable-item/component';
import { isAudioContent, isImageContent, isPdfContent, isVideoContent } from '~/framework/modules/media';

import { CarouselItemProps } from './types';

const CarouselItem = ({
  containerHeight,
  containerWidth,
  hideNavBar,
  index,
  isCurrentItem,
  isNavBarVisible,
  item: media,
  itemSource,
  onInitialAVMediaLoad,
  setHasMediaError,
  setIsCarouselSwipeEnabled,
  showNavBar,
  toggleNavBarVisibility,
}: CarouselItemProps) => {
  const [isImageError, setIsImageError] = React.useState(false);
  const [isPdfError, setIsPdfError] = React.useState(false);
  const [isPlayerError, setIsPlayerError] = React.useState(false);
  const [isPdfLoadTimeout, setIsPdfLoadTimeout] = React.useState(false);
  const [isPlayerLoadTimeout, setIsPlayerLoadTimeout] = React.useState(false);

  if (!media.src) {
    setHasMediaError(index);
    return <UnknownItem />;
  }

  if (isImageError || isPdfError || isPlayerError || isPlayerLoadTimeout || isPdfLoadTimeout || !media.mime)
    return <UnviewableItem media={media} />;

  if (!media.mime && media.src) return <UnviewableItem media={media} />;

  if (isImageContent(media)) {
    return (
      <ImageItem
        containerHeight={containerHeight}
        containerWidth={containerWidth}
        hideNavBar={hideNavBar}
        showNavBar={showNavBar}
        isNavBarVisible={isNavBarVisible}
        isShown={isCurrentItem}
        setIsImageError={setIsImageError}
        source={itemSource as ImageURISource}
        toggleNavBarVisibility={toggleNavBarVisibility}
      />
    );
  }

  if (isAudioContent(media) || isVideoContent(media)) {
    return (
      <PlayerItem
        hideNavBar={hideNavBar}
        isCurrentItem={isCurrentItem}
        isPlayerLoadTimeout={isPlayerLoadTimeout}
        item={media}
        itemIndex={index}
        onInitialMediaLoad={onInitialAVMediaLoad}
        setIsPlayerError={setIsPlayerError}
        setIsPlayerLoadTimeout={setIsPlayerLoadTimeout}
        showNavBar={showNavBar}
        source={itemSource}
      />
    );
  }

  if (isPdfContent(media)) {
    return (
      <PdfItem
        hideNavBar={hideNavBar}
        isNavBarVisible={isNavBarVisible}
        isPdfLoadTimeout={isPdfLoadTimeout}
        isShown={isCurrentItem}
        setIsCarouselSwipeEnabled={setIsCarouselSwipeEnabled}
        setIsPdfError={setIsPdfError}
        setIsPdfLoadTimeout={setIsPdfLoadTimeout}
        source={itemSource}
        toggleNavBar={toggleNavBarVisibility}
      />
    );
  }

  return <UnviewableItem media={media} />;
};

export default React.memo(CarouselItem);
