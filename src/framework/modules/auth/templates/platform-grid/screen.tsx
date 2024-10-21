import * as React from 'react';
import { View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';
import type { AuthPlatformGridScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { TouchableSelectorPictureCard } from '~/framework/components/card/pictureCard';
import { UI_SIZES } from '~/framework/components/constants';
import GridList from '~/framework/components/GridList';
import { PageView } from '~/framework/components/page';
import { HeadingSText, SmallText } from '~/framework/components/text';
import { AuthNavigationTemplatesParams } from '~/framework/modules/auth/navigation';
import { navigationDispatchMultiple } from '~/framework/modules/auth/navigation/main-account/router';
import { navBarOptions } from '~/framework/navigation/navBar';
import appConf, { Platform } from '~/framework/util/appConf';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationTemplatesParams, 'platforms'>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('auth-platform-grid-title'),
  }),
});

export function AuthPlatformGridScreen(props: AuthPlatformGridScreenPrivateProps) {
  const { getNextRoute, navigation } = props;
  const onOpenItem = React.useCallback(
    (item: Platform) => navigationDispatchMultiple(navigation, getNextRoute(item)),
    [getNextRoute, navigation]
  );
  return (
    <PageView statusBar="none">
      <GridList
        data={appConf.platforms}
        renderItem={({ item }) => (
          <TouchableSelectorPictureCard
            picture={item.logoType === 'Image' ? { source: item.logo, type: 'Image' } : { name: item.logo, type: item.logoType }}
            pictureStyle={styles.picture}
            text={item.displayName}
            onPress={() => onOpenItem(item)}
            testID={`network-${item.name}`}
          />
        )}
        keyExtractor={item => item.url}
        ListHeaderComponent={
          <>
            <HeadingSText style={styles.heading} testID="network-welcome-title">
              {I18n.get('auth-platformselect-welcome')}
            </HeadingSText>
            <SmallText style={styles.lightP} testID="network-welcome-subtitle">
              {I18n.get('auth-platformselect-select')}
            </SmallText>
          </>
        }
        alwaysBounceVertical={false}
        overScrollMode="never"
        ListFooterComponent={<View style={{ paddingBottom: UI_SIZES.screen.bottomInset }} />}
        gap={UI_SIZES.spacing.big}
        gapOutside={UI_SIZES.spacing.big}
      />
    </PageView>
  );
}

export default AuthPlatformGridScreen;
