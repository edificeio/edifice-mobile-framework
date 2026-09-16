import * as React from 'react';
import { Platform } from 'react-native';

import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackHeaderBackProps, NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import { I18n } from '~/app/i18n';
import { headerAction, modalScreenOptions } from '~/app/navigation/util';
import theme from '~/app/theme';
import PopupMenu from '~/framework/components/menus/popup';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import NavBarActionsGroup from '~/framework/components/navigation/navbar-actions-group';
import { FileMedia } from '~/framework/modules/media';
import { IModalsNavigationParams } from '~/framework/navigation/modals';

import { showPrivacyAlert } from './util';

const isAndroid = Platform.OS === 'android';

export const getNavActions = ({
  isError,
  media,
  navigation,
  onShare,
  route,
}: {
  isError: boolean;
  media: FileMedia;
  onShare: () => Promise<void>;
} & NativeStackScreenProps<ParamListBase>): Partial<NativeStackNavigationOptions> => {
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

export const NavbarButtons = React.memo(
  ({ disabled = false, media, onShare }: { disabled?: boolean; media: FileMedia; onShare: () => void }) => {
    const navigation = useNavigation<NavigationProp<IModalsNavigationParams>>();

    return (
      <NavBarActionsGroup
        elements={[
          <NavBarAction
            disabled={disabled}
            onPress={() => showPrivacyAlert(() => navigation.navigate('media/download', { media }))}
            icon="ui-download"
            testID="media-navbar-download"
          />,
          <PopupMenu
            testID="media-navbar-share"
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
