import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import GridList from '~/framework/components/GridList';
import { TouchableSelectorPictureCard } from '~/framework/components/card/pictureCard';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { HeadingSText, SmallText } from '~/framework/components/text';
import { AuthNavigationTemplatesParams } from '~/framework/modules/auth/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import appConf, { Platform } from '~/framework/util/appConf';

import styles from './styles';
import type { AuthPlatformGridScreenPrivateProps } from './types';

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
  const { navigation, getNextRoute } = props;
  const onOpenItem = React.useCallback((item: Platform) => navigation.dispatch(getNextRoute(item)), [getNextRoute, navigation]);
  return (
    <PageView statusBar="none">
      <GridList
        data={appConf.platforms}
        renderItem={({ item }) => (
          <TouchableSelectorPictureCard
            picture={item.logoType === 'Image' ? { type: 'Image', source: item.logo } : { type: item.logoType, name: item.logo }}
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
