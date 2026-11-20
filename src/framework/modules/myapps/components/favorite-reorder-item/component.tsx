import * as React from 'react';
import { ColorValue, Pressable, View } from 'react-native';

import { SvgUri } from 'react-native-svg';

import theme from '~/app/theme';
import { genericHitSlop } from '~/framework/components/constants';
import { Svg, SvgProps } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { Image } from '~/framework/modules/media/components/image';
import type { AppIcon } from '~/framework/modules/myapps/components/my-apps-card/types';
import { resolveAppIcon } from '~/framework/modules/myapps/components/my-apps-card/utils';
import { resolveAppColor } from '~/framework/modules/myapps/reducer/adapter';
import { computeTestID } from '~/framework/modules/myapps/utils';

import { APP_ICON_SIZE, getItemStyle, styles } from './styles';
import type { FavoriteReorderItemProps } from './types';

// The drag must start while the finger is still down: started on press in, a quick tap is released
// before the list arms the drag, and the item stays active. A few frames are enough and feel instant.
const HANDLE_DRAG_DELAY_MS = 40;
// Longer on the rest of the item, so that a scroll started there is not taken for a drag.
const ITEM_DRAG_DELAY_MS = 200;

const renderAppIcon = (appIcon: AppIcon, fill: ColorValue, onError: () => void) => {
  switch (appIcon.type) {
    case 'svg':
      return <Svg name={appIcon.name as SvgProps['name']} width={APP_ICON_SIZE} height={APP_ICON_SIZE} fill={fill} />;
    case 'svg-uri':
      return <SvgUri uri={appIcon.uri} width={APP_ICON_SIZE} height={APP_ICON_SIZE} onError={onError} />;
    case 'image':
      return <Image source={appIcon.source} style={styles.appIcon} onError={onError} />;
    default:
      return null;
  }
};

const FavoriteReorderItem = ({ app, isActive, isPlaceholder = false, onDrag }: Readonly<FavoriteReorderItemProps>) => {
  const [hasIconError, setHasIconError] = React.useState(false);

  const appIcon = React.useMemo(() => resolveAppIcon(app.icon), [app.icon]);
  const appColor = resolveAppColor(app.color);
  const iconContainerStyle = React.useMemo(
    () => (appColor ? [styles.iconContainer, { backgroundColor: appColor }] : styles.iconContainer),
    [appColor],
  );
  const iconFill = appColor ? theme.palette.grey.white : theme.palette.grey.black;

  const onIconError = React.useCallback(() => setHasIconError(true), []);

  // The placeholder is a picture of the dragged item: it must not answer to touches nor to test queries.
  const isDragDisabled = isActive || isPlaceholder;
  const testID = isPlaceholder ? undefined : computeTestID(app);

  return (
    <Pressable
      delayLongPress={ITEM_DRAG_DELAY_MS}
      disabled={isDragDisabled}
      onLongPress={onDrag}
      style={getItemStyle(isActive, isPlaceholder)}
      testID={testID ? `${testID}-reorder-item` : undefined}>
      <View style={iconContainerStyle}>{hasIconError ? null : renderAppIcon(appIcon, iconFill, onIconError)}</View>
      <SmallText numberOfLines={1} style={styles.name}>
        {app.displayName}
      </SmallText>
      <Pressable
        delayLongPress={HANDLE_DRAG_DELAY_MS}
        disabled={isDragDisabled}
        hitSlop={genericHitSlop}
        onLongPress={onDrag}
        style={styles.handle}
        testID={testID ? `${testID}-reorder-handle` : undefined}>
        <Svg name="ui-burgerMenu" width={APP_ICON_SIZE} height={APP_ICON_SIZE} fill={theme.palette.grey.black} />
      </Pressable>
    </Pressable>
  );
};

export default React.memo(FavoriteReorderItem);
