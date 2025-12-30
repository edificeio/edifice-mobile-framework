import React from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';

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

  const isSvgIcon = app.icon && !isUrlIcon;
  const isWebApp =
    app.type === 'connector' ||
    app.target === '_blank' ||
    /^https?:\/\//.test(app.address) ||
    app.address?.includes('#') ||
    app.address?.startsWith('/pages#');

  console.debug('APP_INFOS', {
    DN: app.displayName,
    iconNormalized: app.icon ? normalizeSvgIconName(app.icon) : undefined,
    isSvgIcon,
    isUrlIcon,
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
        <Svg name="ui-favorite" width={UI_SIZES.spacing.large} height={UI_SIZES.spacing.large} />
      </View>
    );
  };

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.wrapper}>
      <View style={styles.card}>
        {renderFavoriteBadge()}
        {renderIcon()}
      </View>
      <View style={styles.titleRow}>
        <BodyText numberOfLines={2} style={styles.title}>
          {app.displayName}
        </BodyText>

        {isWebApp && (
          <TouchableOpacity>
            <Svg name="ui-external-link" width={UI_SIZES.spacing.medium} height={UI_SIZES.spacing.medium} fill={'black'} />
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
};
