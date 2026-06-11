import React from 'react';
import { View } from 'react-native';

import { useRecyclingState } from '@shopify/flash-list';
import ErrorBoundary from 'react-native-error-boundary';
import { Fade, Placeholder, PlaceholderMedia } from 'rn-placeholder';

import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';
import { Image, ImageLoadingState, ImageProps } from '~/framework/util/media-deprecated';

import styles from './styles';
import { ImageWithFallbackProps } from './types';

const DEFAULT_ICON_SIZE = '58%';

const DefaultImageFallback: React.FC<ImageProps> = imageProps => {
  const containerStyle = React.useMemo(
    () => [styles.moduleImage, imageProps.style, { backgroundColor: theme.palette.grey.pearl }],
    [imageProps.style],
  );

  return (
    <View style={containerStyle} testID="image-fallback">
      <Svg fill={theme.palette.grey.grey} name="ui-image" height={DEFAULT_ICON_SIZE} width={DEFAULT_ICON_SIZE} />
    </View>
  );
};

const ImageLoader: React.FC<ImageProps> = imageProps => {
  const imageLoaderStyle = React.useMemo(
    () => [styles.moduleImage, styles.imageLoaderWrapper, imageProps.style],
    [imageProps.style],
  );

  return (
    <Placeholder Animation={Fade} style={imageLoaderStyle}>
      <PlaceholderMedia style={styles.imageLoader} testID="wiki-image-loader" />
    </Placeholder>
  );
};

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  Fallback = DefaultImageFallback,
  onError,
  onLoad,
  onPartialLoad,
  ...props
}) => {
  const realSource = props.srcSet ?? props.src ?? props.source;
  const isSourceEmpty = !realSource;
  const [imageLoadingState, setImageLoadingState] = useRecyclingState(
    () => (isSourceEmpty ? ImageLoadingState.Error : ImageLoadingState.Loading),
    // Note: even when source object differs, fi url is the same, onLoad won't be called on iOS.
    // So, we must check if the url(s) have changed since the previous update. Serialize data is the simplest way to do this (but not the most effective).
    [JSON.stringify(realSource)],
  );

  const onImageLoadSuccess = React.useCallback<NonNullable<ImageProps['onLoad']>>(
    e => {
      setImageLoadingState(ImageLoadingState.Success);
      onLoad?.(e);
    },
    [onLoad, setImageLoadingState],
  );
  const onImageLoadError = React.useCallback<NonNullable<ImageProps['onError']>>(
    e => {
      setImageLoadingState(ImageLoadingState.Error);
      onError?.(e);
    },
    [onError, setImageLoadingState],
  );

  const onImagePartialLoad = React.useCallback<NonNullable<ImageProps['onPartialLoad']>>(() => {
    setImageLoadingState(ImageLoadingState.Success);
    onPartialLoad?.();
  }, [onPartialLoad, setImageLoadingState]);

  const FallbackComponent = React.useCallback(() => {
    return React.isValidElement<any>(Fallback) ? Fallback : <Fallback {...props} />;
  }, [Fallback, props]);

  return imageLoadingState === ImageLoadingState.Error ? (
    <FallbackComponent />
  ) : (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <>
        <Image {...props} onPartialLoad={onImagePartialLoad} onLoad={onImageLoadSuccess} onError={onImageLoadError} />
        {imageLoadingState === ImageLoadingState.Loading && <ImageLoader {...props} />}
      </>
    </ErrorBoundary>
  );
};

export default ImageWithFallback;
