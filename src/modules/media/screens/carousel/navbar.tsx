import * as React from 'react';
import { Platform } from 'react-native';

import { NativeStackHeaderBackProps, NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { headerAction } from '~/app/navigation/util';
import type { RootNavigation } from '~/app/navigation-new';
import theme from '~/app/theme';
import PopupMenu from '~/framework/components/menus/popup';
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
 * Actions on the right of the header: download and share (options).
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
}): Partial<NativeStackNavigationOptions> => {
  const getDownloadAction = (props: NativeStackHeaderBackProps) =>
    headerAction(
      {
        disabled: isError,
        icon: 'ui-download',
        onPress: () => showPrivacyAlert(() => navigation.navigate('media/download', { media })),
        testID: 'media-navbar-download',
      },
      props,
    );
  const getOptionsActions = (props: NativeStackHeaderBackProps) => {
    const action = headerAction(
      {
        disabled: isError,
        icon: 'ui-options',
        testID: 'media-navbar-options',
      },
      props,
    );
    action.element = (
      <PopupMenu
        testID="media-navbar-share"
        disabled={isError}
        actions={[
          {
            action: () => showPrivacyAlert(onShare),
            icon: {
              android: 'ic_share',
              ios: 'square.and.arrow.up',
            },
            title: I18n.get('carousel-share'),
          },
        ]}>
        {action.element}
      </PopupMenu>
    );
    return action;
  };

  return {
    headerRight: props => [getDownloadAction(props).element, getOptionsActions(props).element],
    unstable_headerRightItems: props => [getDownloadAction(props), getOptionsActions(props)],
  };
};
