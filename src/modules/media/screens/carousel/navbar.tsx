import { Platform } from 'react-native';

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { headerAction, headerMenu, headerRightActions, menuAction, type RootNavigation } from '~/app/navigation-new';
import theme from '~/app/theme';
import { showPrivacyAlert } from '~/modules/media/privacy-alert';
import { FileMedia } from '~/modules/media/types';
import { I18n } from '~/util/i18n';

const isAndroid = Platform.OS === 'android';

/**
 * Options of the header of the carousel: transparent, over the media.
 * Declared by the screen, and given again when the header shows again after it was hidden.
 */
export const getCarouselHeaderOptions = (): NativeStackNavigationOptions => ({
  headerBlurEffect: 'dark',
  headerShadowVisible: false,
  headerStyle: { backgroundColor: isAndroid ? theme.ui.shadowColorTransparent?.toString() : undefined },
  headerTransparent: true,
  // The screen is dark: the header (Liquid Glass buttons) must be too, whatever the theme. Option added by our patch of `@react-navigation/native-stack`.
  headerUserInterfaceStyle: 'dark',
  scrollEdgeEffects: { bottom: 'hidden', left: 'hidden', right: 'hidden', top: 'hidden' },
  statusBarStyle: 'light',
  // Note: ENABLING-769 for some reason title declared here cannot be overriden in the screen itself with setOptions.
});

/**
 * Actions on the right of the header, from right to left: the options (a menu with « share ») at the edge, then download.
 * Native items on iOS (icons of SF Symbols), the icons of the app on Android.
 */
export const getNavActions = ({
  isError,
  media,
  navigation,
  onShare,
}: {
  isError: boolean;
  media: FileMedia;
  navigation: RootNavigation;
  onShare: () => Promise<void>;
}) =>
  headerRightActions(
    headerMenu({
      disabled: isError,
      icon: { android: 'ui-options', ios: { name: 'ellipsis', type: 'sfSymbol' } },
      items: [
        menuAction({
          icon: { android: 'ic_share', ios: { name: 'square.and.arrow.up', type: 'sfSymbol' } },
          label: I18n.get('carousel-share'),
          onPress: () => showPrivacyAlert(onShare),
          testID: 'media-navbar-share',
        }),
      ],
      // ToDo(media): a translation of « options » for screen readers (the menu only shares, for now)
      label: I18n.get('carousel-share'),
      testID: 'media-navbar-options',
    }),
    headerAction({
      disabled: isError,
      icon: { android: 'ui-download', ios: { name: 'square.and.arrow.down', type: 'sfSymbol' } },
      label: I18n.get('carousel-filepreview-download'),
      onPress: () => showPrivacyAlert(() => navigation.navigate('media/download', { media })),
      testID: 'media-navbar-download',
    }),
  );
