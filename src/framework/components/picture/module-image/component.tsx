import React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';
import { ImageFallbackProps, ImageLoaderProps, ModuleImageProps } from './types';

import theme from '~/app/theme';
import { Icon, Svg } from '~/framework/components/picture';
import { useAppTheme } from '~/framework/modules/myapps/hooks';
import { Image, ImageLoadingState, ImageProps } from '~/framework/util/media-deprecated';

const DEFAULT_DISPLAY_PICTURE = {
  name: 'ui-image',
  type: 'Svg' as const,
};

const DEFAULT_ICON_SIZE = '58%';

const ImageFallback: React.FC<ImageFallbackProps> = ({ badge, fallbackIcon, iconSize, imageProps }) => {
  const displayPicture = typeof badge?.icon === 'string' ? { name: badge.icon, type: 'Svg' as const } : (badge?.icon as any);
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
        <Svg {...(picture as any)} height={iconSize ?? DEFAULT_ICON_SIZE} width={iconSize ?? DEFAULT_ICON_SIZE} />
      )}
      {picture.type === 'Icon' && picture.name && <Icon {...(picture as any)} />}
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

const ModuleImage: React.FC<ModuleImageProps> = ({ appName, fallbackIcon, iconSize, onError, onLoad, ...props }) => {
  // Retrieve badge info from theme using appName
  const appTheme = useAppTheme(appName);
  const finalBadgeInfo = { color: appTheme.colors.regular, icon: appTheme.icon };

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

export default ModuleImage;
