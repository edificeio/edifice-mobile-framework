import * as React from 'react';
import { Alert, Platform } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { I18n } from '~/app/i18n';
import { modalScreenOptions } from '~/app/navigation/util';
import theme from '~/app/theme';
import PopupMenu from '~/framework/components/menus/popup';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import NavBarActionsGroup from '~/framework/components/navigation/navbar-actions-group';
import { IModalsNavigationParams } from '~/framework/navigation/modals';
import { navBarOptions } from '~/framework/navigation/navBar';
import { FileMedia } from '~/framework/util/media';
import { OldStorageFunctions } from '~/framework/util/storage';

import styles from './styles';

const isAndroid = Platform.OS === 'android';

export const NavbarButtons = React.memo(
  ({ disabled = false, media, onShare }: { disabled?: boolean; media: FileMedia; onShare: () => void }) => {
    const navigation = useNavigation<NavigationProp<IModalsNavigationParams>>();

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
          <NavBarAction
            disabled={disabled}
            onPress={() => showPrivacyAlert(() => navigation.navigate(ModalsRouteNames.Download, { media }))}
            icon="ui-download"
            testID="media-navbar-download"
          />,
          <PopupMenu
            testID="media-navbar-share"
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
            <NavBarAction disabled={disabled} icon="ui-options" testID="media-navbar-options" />
          </PopupMenu>,
        ]}
      />
    );
  },
);

export const MultimediaCarouselScreenOptions = modalScreenOptions<'media/carousel'>('fullScreenModal', ({ navigation, route }) => {
  return {
    headerBlurEffect: 'dark',
    headerShadowVisible: false,
    headerStyle: { backgroundColor: isAndroid ? theme.ui.shadowColorTransparent.toString() : undefined },
    headerTransparent: true,
    statusBarStyle: 'light',
    // Note: ENABLING-769 for some reason title declared here cannot be overriden in the screen itself with setOptions.
    // title:
    //   route.params.media.length !== 1
    //     ? I18n.get('carousel-counter', { current: (route.params.startIndex ?? 0) + 1, total: route.params.media.length })
    //     : route.params.title,
  };
});
