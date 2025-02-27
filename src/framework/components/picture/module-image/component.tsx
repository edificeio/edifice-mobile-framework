import React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';
import { ImageFallbackProps, ImageLoaderProps, ImageLoadingState, ModuleConfigForFallbackImage, ModuleImageProps } from './types';

import theme from '~/app/theme';
import { Icon, Svg } from '~/framework/components/picture';
import { Image, ImageProps } from '~/framework/util/media';

const DEFAULT_MODULE_CONFIG: ModuleConfigForFallbackImage = {
  displayColor: {
    pale: theme.palette.grey.pearl,
    regular: theme.palette.grey.grey,
  },
};

const DEFAULT_ICON_SIZE = '58%';

const ImageFallback: React.FC<ImageFallbackProps> = ({ fallbackIcon, iconSize, imageProps, moduleConfig }) => {
  const displayColor = moduleConfig?.displayColor ?? DEFAULT_MODULE_CONFIG?.displayColor;
  const displayPicture = moduleConfig?.displayPicture ?? fallbackIcon;
  const svgContainerStyle = React.useMemo(
    () =>
      displayPicture?.type === 'Svg' ? [styles.moduleImage, { backgroundColor: displayColor?.pale }, imageProps.style] : undefined,
    [displayColor?.pale, imageProps.style, displayPicture?.type],
  );
  const imageContainerStyle = React.useMemo(
    () => (displayPicture?.type === 'Image' ? [styles.moduleImage, imageProps.style] : undefined),
    [displayPicture?.type, imageProps.style],
  );

  switch (displayPicture?.type) {
    case 'Svg':
      return (
        <View style={svgContainerStyle}>
          <Svg {...displayPicture} height={iconSize ?? DEFAULT_ICON_SIZE} width={iconSize ?? DEFAULT_ICON_SIZE} />
        </View>
      );
    case 'Icon':
      return <Icon {...displayPicture} />;
    case 'Image':
      return (
        <View style={imageContainerStyle}>
          <Image {...displayPicture} />
        </View>
      );
    default:
      return null;
  }
};

const ImageLoader: React.FC<ImageLoaderProps> = ({ imageProps }) => {
  const imageLoaderStyle = React.useMemo(
    () => [styles.moduleImage, styles.imageLoaderWrapper, imageProps.style],
    [imageProps.style],
  );

  return (
    <Placeholder Animation={Fade} style={imageLoaderStyle}>
      <PlaceholderMedia style={styles.imageLoader} />
    </Placeholder>
  );
};

const ModuleImage: React.FC<ModuleImageProps> = ({ fallbackIcon, iconSize, moduleConfig, onError, onLoad, ...props }) => {
  // Restore loading state when source changes
  const [imageLoadingState, setImageLoadingState] = React.useState<ImageLoadingState>(ImageLoadingState.Loading);
  const prevSrcSet = React.useRef(props.srcSet);
  const prevSrc = React.useRef(props.src);
  const prevSource = React.useRef(props.source);
  const isSourceEmpty = !props.source && !props.src && !props.srcSet;
  const mergedModuleImageStyle = React.useMemo(() => [styles.moduleImageContainer, props.style], [props.style]);

  React.useEffect(() => {
    if (isSourceEmpty) {
      setImageLoadingState(ImageLoadingState.Error);
    } else {
      if (prevSrcSet.current !== props.srcSet) {
        setImageLoadingState(ImageLoadingState.Loading);
        prevSrcSet.current = props.srcSet;
      } else if (prevSrc.current !== props.src) {
        setImageLoadingState(ImageLoadingState.Loading);
        prevSrc.current = props.src;
      } else if (prevSource.current !== props.source) {
        setImageLoadingState(ImageLoadingState.Loading);
        prevSource.current = props.source;
      }
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

  return (
    <View style={mergedModuleImageStyle}>
      {imageLoadingState === ImageLoadingState.Error || props.source?.uri === undefined ? (
        <ImageFallback fallbackIcon={fallbackIcon} moduleConfig={moduleConfig} imageProps={props} iconSize={iconSize} />
      ) : (
        <>
          <Image {...props} onLoad={onImageLoadSuccess} onError={onImageLoadError} />
          {imageLoadingState === ImageLoadingState.Loading && <ImageLoader imageProps={props} />}
        </>
      )}
    </View>
  );
};

export default ModuleImage;
