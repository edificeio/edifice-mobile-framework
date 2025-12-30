import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { MyAppsCardProps } from './types';
import { useStyles } from './useStyles';

import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
import { Image } from '~/framework/util/media-deprecated';

export const MyAppsCard = ({ app, onLongPress, onPress }: MyAppsCardProps) => {
  const styles = useStyles(app.color);
  const isUrlIcon = app.icon?.startsWith('http') || app.icon?.startsWith('/workspace');
  const isHttp = (icon?: string) => !!icon && /^https?:\/\//.test(icon);
  const isWorkspaceImage = (icon?: string) => !!icon && icon.startsWith('/workspace/');
  const isSvgIconName = (icon?: string) => !!icon && !isHttp(icon) && !isWorkspaceImage(icon);
  const normalizeSvgIconName = (icon: string) => icon.replace(/-large$/, '');

  const svgIconName = useMemo(() => {
    if (!icon) return null;
    if (isImageDistant(icon)) return null;

    return icon.replace(/-large$/, ''); //might be replaced in the future
  }, [icon]);

  const isImageIcon = !!icon && !svgIconName;

  const canShowWebIcon = useMemo(() => {
    if (app.type === 'connector') return true;
    if (app.target === '_blank') return true;
    if (!app.address) return false;

    return HTTP_REGEX.test(app.address) || app.address.includes('#') || app.address.startsWith('/pages#');
  }, [app]);

  console.debug('APP_INFOS', {
    canShowWebIcon,
    DN: app.displayName,
    iconNormalized: svgIconName,
    isImageIcon,
    ...app,
  });

  const renderIcon = () => {
    if (!app.icon) return null;

    if (isSvgIconName(app.icon)) {
      return <Svg name={normalizeSvgIconName(app.icon)} fill="white" width={60} height={60} />;
    }

    return <Image source={{ uri: app.icon }} style={styles.image} />;
  };
  const renderFavoriteBadge = () => {
    if (!app.isFavorite) return null;

    return (
      <View style={styles.favoriteIcon}>
        <Svg name="ui-favorite" width={UI_SIZES.spacing.big} height={UI_SIZES.spacing.big} />
      </View>
    );
  };

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={styles.wrapper}>
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
    </TouchableOpacity>
  );
};
export default MyAppsCard;
