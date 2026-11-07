import React from 'react';
import { Pressable, View } from 'react-native';

import Animated from 'react-native-reanimated';
import { SvgUri } from 'react-native-svg';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg, SvgProps } from '~/framework/components/picture';
import { BodyBoldText, BodyText } from '~/framework/components/text';
import { Image } from '~/modules/media/components';
import { getAppTestID } from '~/modules/myapps/util';

import { useFavoriteBadgeAnimation, useStyles } from './hooks';
import { MyAppsCardProps } from './types';
import { resolveAppIcon } from './utils';

const ICON_SIZE = UI_SIZES.spacing.huge;
const FAVORITE_BADGE_SIZE = UI_SIZES.spacing.big;
const WEB_PICTOGRAM_SIZE = UI_SIZES.spacing.medium;

/**
 * The card of an app: its icon on its color, its label, a favorite badge (animated), and a pictogram when it opens in the browser
 * (no module). Without icon: the icon of a connector for an app without module, else the first letter of its label.
 */
export const MyAppsCard = React.memo(function MyAppsCardComponent({ item, onLongPress, onPress }: MyAppsCardProps) {
  const { app, hasModule, isFavorite } = item;
  const styles = useStyles(app.color);
  const animatedFavoriteStyle = useFavoriteBadgeAnimation(app.name, isFavorite);

  // The icon may fail to load (remote image): then the fallback. Back to the icon when it changes (recycled card)
  const [iconError, setIconError] = React.useState(false);
  React.useEffect(() => setIconError(false), [app.icon]);
  const appIcon = React.useMemo(() => resolveAppIcon(app.icon), [app.icon]);

  // White on the color of the app, black without one
  const iconColor = app.color ? theme.palette.grey.white : theme.palette.grey.black;

  const renderFallbackIcon = () =>
    !hasModule ? (
      <Svg name="default-connector" width={ICON_SIZE} height={ICON_SIZE} fill={iconColor} />
    ) : (
      <BodyBoldText style={styles.letterFallbackStyle}>{app.label.trim().charAt(0).toUpperCase() || '?'}</BodyBoldText>
    );

  const renderIcon = () => {
    if (iconError) return renderFallbackIcon();
    switch (appIcon.type) {
      case 'svg':
        return <Svg name={appIcon.name as SvgProps['name']} width={ICON_SIZE} height={ICON_SIZE} fill={iconColor} />;
      case 'svg-uri':
        return <SvgUri uri={appIcon.uri} width={ICON_SIZE} height={ICON_SIZE} onError={() => setIconError(true)} />;
      case 'image':
        return <Image source={appIcon.source} style={styles.image} onError={() => setIconError(true)} />;
      default:
        return renderFallbackIcon();
    }
  };

  return (
    <Pressable
      accessibilityLabel={app.label}
      accessibilityRole="button"
      onPress={onPress && (() => onPress(item))}
      onLongPress={onLongPress && (() => onLongPress(item))}
      style={({ pressed }) => [styles.wrapper, pressed && styles.wrapperPressed]}
      testID={getAppTestID(app)}>
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <Animated.View style={[styles.favoriteIcon, animatedFavoriteStyle]}>
            <Svg name="ui-favorite" width={FAVORITE_BADGE_SIZE} height={FAVORITE_BADGE_SIZE} />
          </Animated.View>
          {renderIcon()}
        </View>

        <View style={styles.titleRow}>
          <BodyText numberOfLines={2} style={styles.title}>
            {app.label}
          </BodyText>

          {!hasModule && (
            <Svg name="ui-external-link" width={WEB_PICTOGRAM_SIZE} height={WEB_PICTOGRAM_SIZE} fill={theme.palette.grey.black} />
          )}
        </View>
      </View>
    </Pressable>
  );
});

export default MyAppsCard;
