import * as React from 'react';
import { ImageURISource } from 'react-native';

import ImageItem from './image-item/component';
import PdfItem from './pdf-item/component';
import PlayerItem from './player-item/component';
import { CarouselItemProps } from './types';
import UnknownItem from './unknown-item/component';
import UnviewableItem from './unviewable-item/component';
import WebviewItem from './webview-item/component';

import { isAudioContent, isEmbeddedMedia, isImageContent, isPdfContent, isVideoContent } from '~/framework/util/media';

const CarouselItem = ({
  containerHeight,
  containerWidth,
  currentIndex,
  hideNavBar,
  info,
  isNavBarVisible,
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
  const [isWebviewError, setIsWebviewError] = React.useState(false);
  const [isPdfLoadTimeout, setIsPdfLoadTimeout] = React.useState(false);
  const [isPlayerLoadTimeout, setIsPlayerLoadTimeout] = React.useState(false);
  const media = info!.item;
  const isCurrentItem = info!.index === currentIndex;

  if (!info || isImageError || isPdfError || isPlayerError) {
    setHasMediaError(true);
    return <UnknownItem />;
  }
  if (!media.type && media.src) return <UnviewableItem file={media} />;

  if ((media.type as string) === 'iframe' || isEmbeddedMedia(media)) {
    if (isWebviewError) return <UnknownItem />;

    return (
      <WebviewItem isCurrentItem={isCurrentItem} setIsWebviewError={setIsWebviewError} src={(itemSource as ImageURISource).uri!} />
    );
  }

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
        setIsImageError={setIsImageError}
        source={itemSource as ImageURISource}
        toggleNavBarVisibility={toggleNavBarVisibility}
      />
    );
  }

  if (isAudioContent(media) || isVideoContent(media)) {
    if (isPlayerLoadTimeout) {
      return <UnviewableItem file={media} />;
    }
    return (
      <PlayerItem
        hideNavBar={hideNavBar}
        isCurrentItem={isCurrentItem}
        isPlayerLoadTimeout={isPlayerLoadTimeout}
        item={media}
        itemIndex={info.index}
        onInitialMediaLoad={onInitialAVMediaLoad}
        setIsPlayerError={setIsPlayerError}
        setIsPlayerLoadTimeout={setIsPlayerLoadTimeout}
        showNavBar={showNavBar}
        source={itemSource}
      />
    );
  }

  if (isPdfContent(media)) {
    if (isPdfLoadTimeout) {
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
