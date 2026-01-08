import React, { useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { MyAppsCardProps } from './types';
import { useStyles } from './useStyles';

import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
import { Image } from '~/framework/util/media-deprecated';

const HTTP_REGEX: RegExp = /^https?:\/\//;

export const MyAppsCard = ({ app, onLongPress, onPress }: MyAppsCardProps) => {
  const styles = useStyles(app);
  const isImageDistant = (icon: string): boolean => HTTP_REGEX.test(icon) || icon.startsWith('/workspace/');
  const icon = app.icon;

  const svgIconName = useMemo(() => {
    if (!icon) return null;
    if (isImageDistant(icon)) return null;

    return icon.replace(/-large$/, ''); //might be replaced in the future
  }, [icon]);

  const canShowWebIcon = useMemo(() => {
    if (app.type === 'connector' || app.type === 'web') return true;
    if (app.target === '_blank') return true;
    if (!app.address) return false;

    return HTTP_REGEX.test(app.address) || app.address.includes('#') || app.address.startsWith('/pages#');
  }, [app]);

  const renderIcon = useCallback(() => {
    if (!icon) return null;

    if (svgIconName) {
      return <Svg name={svgIconName} fill="white" width={UI_SIZES.spacing.huge} height={UI_SIZES.spacing.huge} />;
    }

    return <Image source={{ uri: icon }} style={styles.image} />;
  }, [icon, svgIconName, styles.image]);

  const renderFavoriteBadge = useCallback(() => {
    if (!app.isFavorite) return null;

    return (
      <View style={styles.favoriteIcon}>
        <Svg name="ui-favorite" width={UI_SIZES.spacing.big} height={UI_SIZES.spacing.big} />
      </View>
    );
  }, [app.isFavorite, styles.favoriteIcon]);

  return (
    <Pressable
      onPress={onPress}
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
            <Svg name="ui-external-link" width={UI_SIZES.spacing.medium} height={UI_SIZES.spacing.medium} fill="black" />
          )}
        </View>
      </View>
    </Pressable>
  );
};
export default MyAppsCard;
