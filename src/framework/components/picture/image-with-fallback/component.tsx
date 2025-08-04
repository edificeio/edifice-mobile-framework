import React from 'react';
import { View } from 'react-native';

import ErrorBoundary from 'react-native-error-boundary';
import { Fade, Placeholder, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';
import { ImageWithFallbackProps } from './types';

import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';
import { Image, ImageLoadingState, ImageProps } from '~/framework/util/media';

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

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ Fallback = DefaultImageFallback, onError, onLoad, ...props }) => {
  // Restore loading state when source changes
  const isSourceEmpty = !props.source && !props.src && !props.srcSet;

  const [imageLoadingState, setImageLoadingState] = React.useState<ImageLoadingState>(
    isSourceEmpty ? ImageLoadingState.Error : ImageLoadingState.Loading,
  );
  const prevSrcSet = React.useRef(props.srcSet);
  const prevSrc = React.useRef(props.src);
  const prevSource = React.useRef(props.source);

  React.useEffect(() => {
    if (isSourceEmpty) {
      setImageLoadingState(ImageLoadingState.Error);
    } else if (prevSrcSet.current !== props.srcSet) {
      setImageLoadingState(ImageLoadingState.Loading);
      prevSrcSet.current = props.srcSet;
    } else if (prevSrc.current !== props.src) {
      setImageLoadingState(ImageLoadingState.Loading);
      prevSrc.current = props.src;
    } else if (prevSource.current !== props.source) {
      setImageLoadingState(ImageLoadingState.Loading);
      prevSource.current = props.source;
    }
  }, [isSourceEmpty, props.source, props.src, props.srcSet]);

  const onImageLoadSuccess = React.useCallback<NonNullable<ImageProps['onLoad']>>(
    e => {
      setImageLoadingState(ImageLoadingState.Success);
      onLoad?.(e);
    },
    [onLoad],
  );
  const onImageLoadError = React.useCallback<NonNullable<ImageProps['onError']>>(
    e => {
      setImageLoadingState(ImageLoadingState.Error);
      onError?.(e);
    },
    [onError],
  );

  const FallbackComponent = React.useCallback(() => {
    return React.isValidElement<any>(Fallback) ? Fallback : <Fallback {...props} />;
  }, [Fallback, props]);

  return imageLoadingState === ImageLoadingState.Error ? (
    <FallbackComponent />
  ) : (
    // @ts-expect-error // This is an issue with React about handling of bigint as children node
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <>
        <Image {...props} onLoad={onImageLoadSuccess} onError={onImageLoadError} />
        {imageLoadingState === ImageLoadingState.Loading && <ImageLoader {...props} />}
      </>
    </ErrorBoundary>
  );
};

export default ImageWithFallback;
