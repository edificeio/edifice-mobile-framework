import React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';
import { ImageFallbackProps, ImageLoaderProps, ImageLoadingState, ModuleConfigForFallbackImage, ModuleImageProps } from './types';

import theme from '~/app/theme';
import { Icon, Svg } from '~/framework/components/picture';
import { Image, ImageProps } from '~/framework/util/media';

const DEFAULT_MODULE_CONFIG: Required<ModuleConfigForFallbackImage> = {
  displayColor: {
    pale: theme.palette.grey.pearl,
    regular: theme.palette.grey.grey,
  },
  displayPicture: {
    name: 'ui-image',
    type: 'Svg',
  },
};

const DEFAULT_ICON_SIZE = '58%';

const ImageFallback: React.FC<ImageFallbackProps> = ({ fallbackIcon, iconSize, imageProps, moduleConfig }) => {
  const displayColor = moduleConfig?.displayColor ?? DEFAULT_MODULE_CONFIG.displayColor;
  const displayPicture = moduleConfig?.displayPicture ?? fallbackIcon ?? DEFAULT_MODULE_CONFIG.displayPicture;

  const containerStyle = React.useMemo(() => {
    if (displayPicture.type === 'Svg' || displayPicture.type === 'Icon')
      return [styles.moduleImage, imageProps.style, { backgroundColor: displayColor.pale }];
    else if (displayPicture.type === 'Image') return [styles.moduleImage, imageProps.style];
    else return undefined;
  }, [displayColor.pale, displayPicture.type, imageProps.style]);

  return (
    <View style={containerStyle} testID="wiki-image-fallback">
      {displayPicture.type === 'Svg' ? (
        <Svg {...displayPicture} height={iconSize ?? DEFAULT_ICON_SIZE} width={iconSize ?? DEFAULT_ICON_SIZE} />
      ) : displayPicture.type === 'Icon' ? (
        <Icon {...displayPicture} />
      ) : displayPicture.type === 'Image' ? (
        <Image {...displayPicture} />
      ) : null}
    </View>
  );
};

const ImageLoader: React.FC<ImageLoaderProps> = ({ imageProps }) => {
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

const ModuleImage: React.FC<ModuleImageProps> = ({ fallbackIcon, iconSize, moduleConfig, onError, onLoad, ...props }) => {
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

  try {
    if (imageLoadingState === ImageLoadingState.Error) throw imageLoadingState;
    else
      return (
        <>
          <Image {...props} onLoad={onImageLoadSuccess} onError={onImageLoadError} testID="wiki-image" />
          {imageLoadingState === ImageLoadingState.Loading && <ImageLoader imageProps={props} />}
        </>
      );
  } catch {
    return <ImageFallback fallbackIcon={fallbackIcon} moduleConfig={moduleConfig} imageProps={props} iconSize={iconSize} />;
  }
};

export default ModuleImage;
