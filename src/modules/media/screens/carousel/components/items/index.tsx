import * as React from 'react';
import { ImageURISource } from 'react-native';

import { isAudioContent, isImageContent, isPdfContent, isVideoContent } from '~/modules/media/types';

import ImageItem from './image/component';
import PdfItem from './pdf/component';
import PlayerItem from './player/component';
import { CarouselItemProps } from './types';
import UnknownItem from './unknown/component';
import UnviewableItem from './unviewable/component';

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
