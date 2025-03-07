import React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';
import { ImageFallbackProps, ImageLoaderProps, ImageLoadingState, ModuleImageProps } from './types';

import theme from '~/app/theme';
import { Icon, Svg } from '~/framework/components/picture';
import { Image, ImageProps } from '~/framework/util/media';

const DEFAULT_MODULE_CONFIG: Required<ModuleImageProps['moduleConfig']> = {
  displayColor: {
    pale: theme.palette.grey.pearl,
    regular: theme.palette.grey.grey,
  },
  displayPicture: {
    name: 'image-not-found',
    type: 'Svg',
  },
};

const DEFAULT_ICON_SIZE = '58%';

const ImageFallback: React.FC<ImageFallbackProps> = ({
  iconSize,
  imageProps,
  moduleConfig: {
    displayColor = DEFAULT_MODULE_CONFIG.displayColor,
    displayPicture = DEFAULT_MODULE_CONFIG.displayPicture,
  } = DEFAULT_MODULE_CONFIG,
}) => {
  const svgContainerStyle = React.useMemo(
    () =>
      displayPicture.type === 'Svg' ? [styles.moduleImage, { backgroundColor: displayColor?.pale }, imageProps.style] : undefined,
    [displayColor?.pale, imageProps.style, displayPicture.type],
  );
  const imageContainerStyle = React.useMemo(
    () => (displayPicture.type === 'Image' ? [styles.moduleImage, imageProps.style] : undefined),
    [displayPicture.type, imageProps.style],
  );

  switch (displayPicture.type) {
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

const ModuleImage: React.FC<ModuleImageProps> = ({ iconSize, moduleConfig, onError, onLoad, ...props }) => {
  // Restore loading state when source changes
  const [prevSource, setPrevSource] = React.useState<typeof props.source | null>(null);
  const [imageLoadingState, setImageLoadingState] = React.useState<ImageLoadingState>(
    props.source ? ImageLoadingState.Loading : ImageLoadingState.Error,
  );
  if (prevSource !== props.source) {
    setImageLoadingState(props.source ? ImageLoadingState.Loading : ImageLoadingState.Error);
    setPrevSource(props.source);
  }

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

  return imageLoadingState === ImageLoadingState.Error ? (
    <ImageFallback moduleConfig={moduleConfig} imageProps={props} iconSize={iconSize} />
  ) : (
    <>
      <Image {...props} onLoad={onImageLoadSuccess} onError={onImageLoadError} />
      {imageLoadingState === ImageLoadingState.Loading && <ImageLoader imageProps={props} />}
    </>
  );
};

export default ModuleImage;
