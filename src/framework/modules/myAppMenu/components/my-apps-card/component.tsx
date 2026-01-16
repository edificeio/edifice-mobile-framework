import React from 'react';
import { Pressable, View } from 'react-native';

import Animated from 'react-native-reanimated';

import { MyAppsCardProps } from './types';
import { useController } from './useController';
import { useStyles } from './useStyles';

import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
import { injectImageSource } from '~/framework/util/media';
import { Image } from '~/framework/util/media/components/image';
import { sessionImageSource } from '~/framework/util/transport';

const HTTP_REGEX: RegExp = /^https?:\/\//;

export const MyAppsCard = ({ app, isFavoritesFilter, onLongPress, onPress }: MyAppsCardProps) => {
  const styles = useStyles(app);
  const isImageDistant = React.useCallback((icon: string): boolean => HTTP_REGEX.test(icon) || icon.startsWith('/workspace/'), []);
  const icon = React.useMemo(() => app.icon, [app.icon]);
  const [isFavorite, setIsFavorite] = React.useState(app.isFavorite);
  // const isFavorite = React.useMemo(() => app.isFavorite, [app.isFavorite]);
  const { animatedFavoriteStyle, imageDimensions } = useController(isFavorite);

  const svgIconName = React.useMemo(() => {
    if (!icon || isImageDistant(icon)) return null;
    if (!icon.includes('/') && !icon.includes('.')) return icon;
    return null;
  }, [icon, isImageDistant]);

  const imageSource = React.useMemo(() => {
    if (!icon || svgIconName) return undefined;

    if (HTTP_REGEX.test(icon)) {
      return { uri: icon };
    }

    if (icon.startsWith('/workspace/')) {
      const fullSource = sessionImageSource(injectImageSource({ uri: icon }, imageDimensions));
      return fullSource;
    }

    const source = sessionImageSource(injectImageSource({ uri: icon }, imageDimensions));
    return source;
  }, [icon, svgIconName, imageDimensions]);

  const canShowWebIcon = React.useMemo(() => !app.isMobile, [app]);

  const renderIcon = React.useCallback(() => {
    if (!icon) {
      return null;
    }

    if (svgIconName) {
      return <Svg name={svgIconName} fill="white" width={UI_SIZES.spacing.huge} height={UI_SIZES.spacing.huge} />;
    }

    return <Image source={imageSource} style={styles.image} />;
  }, [icon, svgIconName, imageSource, styles.image]);

  const renderFavoriteBadge = React.useCallback(() => {
    return (
      <Animated.View style={[styles.favoriteIcon, animatedFavoriteStyle]}>
        <Svg name="ui-favorite" width={UI_SIZES.spacing.big} height={UI_SIZES.spacing.big} />
      </Animated.View>
    );
  }, [animatedFavoriteStyle, styles.favoriteIcon]);

  return (
    <Pressable
      onPress={() => {
        if (isFavoritesFilter) {
          setIsFavorite(prev => !prev);
        } else onPress?.();
      }}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.wrapper, pressed && styles.wrapperPressed]}>
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          {renderFavoriteBadge()}
          {renderIcon()}
        </View>

        <View style={styles.titleRow}>
          <BodyText numberOfLines={2} style={styles.title}>
            {app.displayName}
          </BodyText>

          {canShowWebIcon && (
            <Svg name="ui-external-link" width={UI_SIZES.spacing.medium} height={UI_SIZES.spacing.medium} fill="#000" />
          )}
        </View>
      </View>
    </Pressable>
  );
};
export default MyAppsCard;
