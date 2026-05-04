import * as React from 'react';
import { Alert, Platform } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';
import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import PopupMenu from '~/framework/components/menus/popup';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import NavBarActionsGroup from '~/framework/components/navigation/navbar-actions-group';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarOptions } from '~/framework/navigation/navBar';
import { OldStorageFunctions } from '~/framework/util/storage';

const isAndroid = Platform.OS === 'android';

export const NavbarButtons = React.memo(
  ({ disabled = false, onSave, onShare }: { disabled?: boolean; onSave: () => void; onShare: () => void }) => {
    const showPrivacyAlert = async action => {
      try {
        const getDatePrivacyAlert: string | Temporal.PlainDate | null | undefined =
          await OldStorageFunctions.getItemJson('privacyAlert');
        const today = Temporal.Now.plainDateISO();

        if (!getDatePrivacyAlert) {
          Alert.alert(I18n.get('carousel-privacy-title'), I18n.get('carousel-privacy-text'), [
            {
              onPress: action,
              text: I18n.get('carousel-privacy-button'),
            },
          ]);
          await OldStorageFunctions.setItemJson('privacyAlert', today.toString());
        } else {
          const lastAlertDate = Temporal.PlainDate.from(getDatePrivacyAlert);
          if (Temporal.PlainDate.compare(today, lastAlertDate) > 0) {
            Alert.alert(I18n.get('carousel-privacy-title'), I18n.get('carousel-privacy-text'), [
              {
                onPress: action,
                text: I18n.get('carousel-privacy-button'),
              },
            ]);
            await OldStorageFunctions.setItemJson('privacyAlert', today.toString());
          } else {
            action();
          }
        }
      } catch {
        throw new Error();
      }
    };

    return (
      <NavBarActionsGroup
        elements={[
          <NavBarAction disabled={disabled} onPress={() => showPrivacyAlert(() => onSave())} icon="ui-download" />,
          <PopupMenu
            actions={[
              {
                action: () => showPrivacyAlert(() => onShare()),
                icon: {
                  android: 'ic_share',
                  ios: 'square.and.arrow.up',
                },
                title: I18n.get('carousel-share'),
              },
            ]}>
            <NavBarAction disabled={disabled} icon="ui-options" />
          </PopupMenu>,
        ]}
      />
    );
  },
);

export function computeNavBar({
  navigation,
  route,
}: NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.CarouselMultimedia>): NativeStackNavigationOptions {
  return {
    ...navBarOptions({
      navigation,
      route,
      title:
        route.params.media.length !== 1
          ? I18n.get('carousel-counter', { current: route.params.startIndex ?? 1, total: route.params.media.length })
          : '',
      titleStyle: styles.title,
    }),
    headerBlurEffect: 'dark',
    headerShadowVisible: false,
    headerStyle: { backgroundColor: isAndroid ? theme.ui.shadowColorTransparent.toString() : undefined },
    headerTransparent: true,
  };
}
