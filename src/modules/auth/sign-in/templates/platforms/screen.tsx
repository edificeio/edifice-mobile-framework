import * as React from 'react';
import { ScrollViewProps } from 'react-native';

import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '~/app/theme';
import TouchableSelectorPictureCard from '~/framework/components/card/picture';
import { UI_SIZES } from '~/framework/components/constants';
import GridList from '~/framework/components/GridList';
import { HeadingSText, SmallText } from '~/framework/components/text';
import { DebugOptions } from '~/framework/modules/debug';
import appConf from '~/framework/util/appConf';
import { I18n } from '~/util/i18n';

import styles from './styles';
import type { AuthPlatformsScreenProps } from './types';

export function AuthPlatformsScreenTemplate({
  contentContainerStyle: _contentContainerStyle,
  onOpenItem,
  showWelcome = true,
  style: _style,
}: AuthPlatformsScreenProps & Pick<ScrollViewProps, 'style' | 'contentContainerStyle'>) {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const style = React.useMemo(() => [{ backgroundColor: theme.ui.background.page }, _style], [_style]);
  const contentContainerStyle = React.useMemo(
    () => [{ paddingBottom: bottomInset }, _contentContainerStyle],
    [_contentContainerStyle, bottomInset],
  );

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const welcomeStyle = React.useMemo(() => [{ lineHeight: headerHeight - insets.top }, styles.heading], [headerHeight, insets.top]);

  return (
    <GridList
      style={style}
      data={appConf.platforms}
      renderItem={({ item }) => (
        <TouchableSelectorPictureCard
          picture={item.logoType === 'Image' ? { source: item.logo, type: 'Image' } : { name: item.logo, type: item.logoType }}
          pictureStyle={styles.picture}
          text={item.displayName}
          textStyle={styles.cardLabelText}
          style={styles.cardStyle}
          onPress={() => onOpenItem?.(item)}
          testID={`network-${item.name}`}
        />
      )}
      keyExtractor={item => item.url}
      ListHeaderComponent={
        <>
          {showWelcome && (
            <HeadingSText style={welcomeStyle} testID="network-welcome-title">
              {I18n.get('auth-platformselect-welcome')}
            </HeadingSText>
          )}
          <SmallText style={styles.lightP} testID="network-welcome-subtitle">
            {I18n.get('auth-platformselect-select')}
          </SmallText>
        </>
      }
      alwaysBounceVertical={false}
      contentContainerStyle={contentContainerStyle}
      overScrollMode="never"
      ListFooterComponent={<DebugOptions />}
      gap={[UI_SIZES.spacing.big, UI_SIZES.spacing.small]}
      gapOutside={UI_SIZES.spacing.big}
    />
  );
}

export default AuthPlatformsScreenTemplate;
