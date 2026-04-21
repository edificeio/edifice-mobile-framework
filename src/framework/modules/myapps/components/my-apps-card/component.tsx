import React from 'react';
import { Pressable, View } from 'react-native';

import Animated from 'react-native-reanimated';
import { SvgUri } from 'react-native-svg';

import { MyAppsCardProps } from './types';
import { useController } from './useController';
import { useStyles } from './useStyles';
import { resolveAppIcon } from './utils';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText, BodyText } from '~/framework/components/text';
import { getAppTestID } from '~/framework/modules/myapps/utils';
import { Image } from '~/framework/util/media/components/image';

const LetterFallback = ({ label }: { label: string }) => {
  const letter = label?.trim()?.charAt(0)?.toUpperCase() ?? '?';
  const styles = useStyles();

  return <BodyBoldText style={styles.letterFallbackStyle}>{letter}</BodyBoldText>;
};

export const MyAppsCard = ({ app, onLongPress, onPress }: MyAppsCardProps) => {
  const styles = useStyles(app);
  const { animatedFavoriteStyle } = useController(app.name, app.isFavorite);

  const [iconError, setIconError] = React.useState(false);

  React.useEffect(() => {
    setIconError(false);
  }, [app.icon]);

  const appIcon = React.useMemo(() => resolveAppIcon(app.icon), [app.icon]);

  const isLetterFallback = appIcon.type === 'fallback' || iconError;

  const canShowWebIcon = !app.isMobile;

  const renderIcon = () => {
    if (isLetterFallback) {
      return <LetterFallback label={app.displayName} />;
    }

    switch (appIcon.type) {
      case 'svg':
        return <Svg cached name={appIcon.name} width={UI_SIZES.spacing.huge} height={UI_SIZES.spacing.huge} fill="white" />;

      case 'svg-uri':
        return (
          <SvgUri
            uri={appIcon.uri}
            width={UI_SIZES.spacing.huge}
            height={UI_SIZES.spacing.huge}
            onError={() => setIconError(true)}
          />
        );

      case 'image':
        return <Image source={appIcon.source} style={styles.image} onError={() => setIconError(true)} />;

      default:
        return <LetterFallback label={app.displayName} />;
    }
  };

  const renderFavoriteBadge = React.useCallback(
    () => (
      <Animated.View style={[styles.favoriteIcon, animatedFavoriteStyle]}>
        <Svg name="ui-favorite" width={UI_SIZES.spacing.big} height={UI_SIZES.spacing.big} />
      </Animated.View>
    ),
    [animatedFavoriteStyle, styles.favoriteIcon],
  );

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.wrapper, pressed && styles.wrapperPressed]}
      testID={getAppTestID(app)}>
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
            <Svg
              name="ui-external-link"
              width={UI_SIZES.spacing.medium}
              height={UI_SIZES.spacing.medium}
              fill={theme.palette.grey.black}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default MyAppsCard;
