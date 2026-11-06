import React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderMedia } from 'rn-placeholder';

import theme from '~/app/theme';
import { Icon, Svg } from '~/framework/components/picture';
import { Image, ImageLoadingState, ImageProps } from '~/framework/util/media-deprecated';
import { useEntAppDisplay } from '~/modules/myapps/hooks';

import styles from './styles';
import { EntAppImageProps, ImageFallbackProps, ImageLoaderProps } from './types';

const DEFAULT_DISPLAY_PICTURE = {
  name: 'ui-image',
  type: 'Svg' as const,
};

const DEFAULT_ICON_SIZE = '58%';

const ImageFallback: React.FC<ImageFallbackProps> = ({ badge, fallbackIcon, iconSize, imageProps }) => {
  const displayPicture = typeof badge?.icon === 'string' ? { name: badge.icon, type: 'Svg' as const } : badge?.icon;
  const picture = displayPicture ?? fallbackIcon ?? DEFAULT_DISPLAY_PICTURE;
  const bgColor = badge?.color ?? theme.palette.grey.pearl;

  const containerStyle = React.useMemo(() => {
    if (picture.type === 'Svg' || picture.type === 'Icon')
      return [styles.moduleImage, imageProps.style, { backgroundColor: bgColor }];
    if (picture.type === 'Image') return [styles.moduleImage, imageProps.style];
    return undefined;
  }, [bgColor, picture.type, imageProps.style]);

  return (
    <View style={containerStyle} testID="wiki-image-fallback">
      {picture.type === 'Svg' && picture.name && (
        <Svg {...picture} height={iconSize ?? DEFAULT_ICON_SIZE} width={iconSize ?? DEFAULT_ICON_SIZE} />
      )}
      {picture.type === 'Icon' && picture.name && <Icon {...picture} />}
      {picture.type === 'Image' && <Image {...picture} />}
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

/**
 * An image of a resource of an app of the ENT. While it loads: a placeholder. When there is none, or it can't be loaded: the colors and
 * the icon of the app (see `useEntAppDisplay`), else `fallbackIcon`.
 * By the name of the app in the ENT (from the server…). For a module of the app, use `ModuleImage`.
 */
const EntAppImage: React.FC<EntAppImageProps> = ({ entAppName, fallbackIcon, iconSize, onError, onLoad, ...props }) => {
  // Colors and icon of the fallback: the ones of the app
  const appDisplay = useEntAppDisplay(entAppName);
  const finalBadgeInfo = { color: appDisplay.colors.regular, icon: appDisplay.icon };

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
    return <ImageFallback badge={finalBadgeInfo} fallbackIcon={fallbackIcon} iconSize={iconSize} imageProps={props} />;
  }
};

export default EntAppImage;
