import * as React from 'react';
import { ImageURISource } from 'react-native';

import ImageItem from './image-item/component';
import PdfItem from './pdf-item/component';
import PlayerItem from './player-item/component';
import { CarouselItemProps } from './types';
import UnknownItem from './unknown-item/component';
import UnviewableItem from './unviewable-item/component';

import { isAudioContent, isImageContent, isPdfContent, isVideoContent } from '~/framework/util/media';

const CarouselItem = ({
  containerHeight,
  containerWidth,
  currentIndex,
  hideNavBar,
  info,
  isCurrentMediaUnknown,
  isNavBarVisible,
  itemSource,
  onInitialAVMediaLoad,
  setIsCarouselSwipeEnabled,
  showNavBar,
  toggleNavBarVisibility,
}: CarouselItemProps) => {
  const [isPdfError, setIsPdfError] = React.useState(false);
  const [isPdfLoadTimeout, setIsPdfLoadTimeout] = React.useState(false);

  if (isCurrentMediaUnknown || !info) {
    return <UnknownItem />;
  }

  const media = info!.item;
  const isCurrentItem = info!.index === currentIndex;

  if (!media.mime && media.src) return <UnviewableItem file={media} />;

  if (isImageContent(media)) {
    return (
      <ImageItem
        containerHeight={containerHeight}
        containerWidth={containerWidth}
        hideNavBar={hideNavBar}
        showNavBar={showNavBar}
        isNavBarVisible={isNavBarVisible}
        isShown={isCurrentItem}
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
        item={media}
        itemIndex={info.index}
        onInitialMediaLoad={onInitialAVMediaLoad}
        showNavBar={showNavBar}
        source={itemSource}
      />
    );
  }

  if (isPdfContent(media)) {
    if (isPdfError || isPdfLoadTimeout) {
      return <UnviewableItem file={media} />;
    }
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

  return <UnviewableItem file={media} />;
};

export default React.memo(CarouselItem);
