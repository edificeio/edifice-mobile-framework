import * as React from 'react';
import { ImageURISource } from 'react-native';

import ImageItem from './image-item/component';
import PdfItem from './pdf-item/component';
import PlayerItem from './player-item/component';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './styles';
import { CarouselItemProps } from './types';
import UnknownItem from './unknown-item/component';
import UnviewableItem from './unviewable-item/component';

import { isAudioContent, isImageContent, isPdfContent, isVideoContent } from '~/framework/util/media';

export const CarouselItem = ({
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

  if (isCurrentMediaUnknown || !info) {
    return <UnknownItem />;
  }

  const media = info!.item;
  const isCurrentItem = info!.index === currentIndex;

  if (!media.mime && media.src) return <UnviewableItem file={media} />;

  if (isImageContent(media)) {
    return (
      <ImageItem
        containerHeight={SCREEN_HEIGHT}
        containerWidth={SCREEN_WIDTH}
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
        index={currentIndex}
        item={media}
        isCurrentItem={isCurrentItem}
        hideNavBar={hideNavBar}
        onInitialMediaLoad={onInitialAVMediaLoad}
        showNavBar={showNavBar}
        source={itemSource}
      />
    );
  }

  if (isPdfContent(media)) {
    if (isPdfError) {
      return <UnviewableItem file={media} />;
    }
    return (
      <PdfItem
        hideNavBar={hideNavBar}
        isNavBarVisible={isNavBarVisible}
        isShown={isCurrentItem}
        setIsCarouselSwipeEnabled={setIsCarouselSwipeEnabled}
        setIsPdfError={setIsPdfError}
        source={itemSource}
        toggleNavBar={toggleNavBarVisibility}
      />
    );
  }

  return <UnviewableItem file={media} />;
};
