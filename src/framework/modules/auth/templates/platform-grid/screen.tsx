import * as React from 'react';
import { View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import RNConfigReader from 'react-native-config-reader';
import DeviceInfo from 'react-native-device-info';

import styles from './styles';
import type { AuthPlatformGridScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { ButtonLineGroup, LineButton } from '~/framework/components/buttons/line';
import { TouchableSelectorPictureCard } from '~/framework/components/card/pictureCard';
import { UI_SIZES } from '~/framework/components/constants';
import GridList from '~/framework/components/GridList';
import { PageView } from '~/framework/components/page';
import { HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';
import { AuthNavigationTemplatesParams, authRouteNames } from '~/framework/modules/auth/navigation';
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
    [getNextRoute, navigation],
  );
  const version = {
    buildNumber: DeviceInfo.getBuildNumber(),
    deviceModel: DeviceInfo.getModel(),
    os: DeviceInfo.getSystemName(),
    osVersion: DeviceInfo.getSystemVersion(),
    versionNumber: DeviceInfo.getVersion(),
    versionOverride: RNConfigReader.BundleVersionOverride as string,
    versionType: RNConfigReader.BundleVersionType as string,
  };
  const renderDebug = () => {
    if (appConf.isDebugEnabled) {
      return (
        <View style={styles.footer}>
          <SmallBoldText style={styles.version} testID="account-version-number">
            {I18n.get('user-page-versionnumber')} {version.versionNumber}
          </SmallBoldText>
          <SmallBoldText style={styles.version}>
            {`${version.versionType} (${version.buildNumber}) – ${version.versionOverride} - ${version.os} ${version.osVersion} - ${version.deviceModel}`}
          </SmallBoldText>
          <View style={styles.section}>
            <HeadingSText style={styles.sectionTitle}>Debug</HeadingSText>
            <ButtonLineGroup>
              <LineButton
                title="Network Log"
                icon="ui-print"
                onPress={() => {
                  props.navigation.navigate(authRouteNames.network, {});
                }}
              />
              <LineButton
                title="Debug Log"
                icon="ui-print"
                onPress={() => {
                  props.navigation.navigate(authRouteNames.log, { detailsRoute: authRouteNames.detailed });
                }}
              />
            </ButtonLineGroup>
          </View>
        </View>
      );
    }
    return <View style={styles.footer} />;
  };
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
        ListFooterComponent={renderDebug()}
        gap={UI_SIZES.spacing.big}
        gapOutside={UI_SIZES.spacing.big}
      />
    </PageView>
  );
}

export default AuthPlatformGridScreen;
