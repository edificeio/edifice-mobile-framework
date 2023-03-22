import { useHeaderHeight } from '@react-navigation/elements';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, ImageURISource, ScrollView, View } from 'react-native';
import RNConfigReader from 'react-native-config-reader';
import DeviceInfo from 'react-native-device-info';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyBoldText, SmallBoldText } from '~/framework/components/text';
import { logoutAction } from '~/framework/modules/auth/actions';
import { getSession } from '~/framework/modules/auth/reducer';
import { NavBarAction, navBarOptions } from '~/framework/navigation/navBar';
import { formatSource } from '~/framework/util/media';
import { tryAction } from '~/framework/util/redux/actions';
import { OAuth2RessourceOwnerPasswordClient } from '~/infra/oauth';
import Avatar, { Size } from '~/ui/avatars/Avatar';

import moduleConfig from '../../module-config';
import { UserNavigationParams, userRouteNames } from '../../navigation';
import styles from './styles';
import type { UserHomeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('MyAccount'),
  headerShadowVisible: false,
});

/**
 * Setup a fancy navBar decoration feature
 * That consists of adding a svg as a background that scroll with the page content
 * @returns the React Element of the decoration
 */
function useCurvedNavBarFeature() {
  const navBarHeight = useHeaderHeight();

  // SVG size management
  const svgDisplayWidth = UI_SIZES.screen.width;
  const svgDisplayHeight = Math.ceil(
    svgDisplayWidth * (useCurvedNavBarFeature.svgOriginalHeight / useCurvedNavBarFeature.svgOriginalWidth),
  );
  const svgDisplayTopOffset =
    Math.ceil(
      (navBarHeight - useCurvedNavBarFeature.svgDisplayTopOffsetTolerance) *
        (svgDisplayWidth / useCurvedNavBarFeature.svgOriginalWidth),
    ) - svgDisplayHeight;

  // SVG size management
  return React.useMemo(() => {
    return (
      <NamedSVG
        width={svgDisplayWidth}
        height={svgDisplayHeight}
        style={[styles.navBarSvgDecoration, { top: svgDisplayTopOffset }]}
        fill={theme.palette.primary.regular}
        name="userpage-header"
      />
    );
  }, [svgDisplayHeight, svgDisplayTopOffset, svgDisplayWidth]);
}
useCurvedNavBarFeature.svgOriginalWidth = 375;
useCurvedNavBarFeature.svgOriginalHeight = 545;
useCurvedNavBarFeature.svgDisplayTopOffsetTolerance = 2;

/**
 * Setup a big avatar that acts as a button to Profile Page
 * @returns the React Element of the avatar button
 */
function useProfileAvatarFeature(session: UserHomeScreenPrivateProps['session']) {
  const userProfilePicture = React.useMemo(() => {
    const uri = session?.platform && session?.user.photo ? new URL(`${session.platform.url}${session.user.photo}`) : undefined;
    if (uri) {
      const uti = OAuth2RessourceOwnerPasswordClient.connection?.getUniqueSessionIdentifier();
      if (uti) uri.searchParams.append('uti', uti);
    }
    return (
      uri &&
      ({
        ...formatSource(uri.href),
      } as ImageURISource)
    );
  }, [session?.platform, session?.user.photo]);

  const navigation = useNavigation<NavigationProp<UserNavigationParams>>();
  return React.useMemo(() => {
    return !userProfilePicture ? (
      <TouchableOpacity onPress={() => navigation.navigate(userRouteNames.profile, {})}>
        <Avatar sourceOrId={userProfilePicture} size={Size.verylarge} id="" />
      </TouchableOpacity>
    ) : (
      <Avatar sourceOrId={userProfilePicture} size={Size.verylarge} id="" />
    );
  }, [navigation, userProfilePicture]);
}

/**
 * Setup a Logout button feature
 * @param handleLogout a callback supposed to log the user out.
 * @returns the React Element of the logout button
 */
function useLogoutFeature(handleLogout: UserHomeScreenPrivateProps['handleLogout']) {
  /**
   * Displays an Alert to the user that allows logging out
   * Caution: Alert callbacks eats any exception thrown silently.
   */
  const doLogout = React.useCallback(() => {
    Alert.alert('', I18n.t('auth-disconnectConfirm'), [
      {
        text: I18n.t('common.cancel'),
        style: 'default',
      },
      {
        text: I18n.t('directory-disconnectButton'),
        style: 'destructive',
        onPress: () => handleLogout(),
      },
    ]);
  }, [handleLogout]);

  /**
   * renders the logout button
   */
  return React.useMemo(() => {
    return (
      <TouchableOpacity onPress={() => doLogout()}>
        <SmallBoldText style={styles.logoutButton}>{I18n.t('directory-disconnectButton')}</SmallBoldText>
      </TouchableOpacity>
    );
  }, [doLogout]);
}

/**
 * Setup a version number feature that can secretly display detailed information when long pressed.
 * @returns the React Element of the touchable version text
 */
function useVersionFeature(session: UserHomeScreenPrivateProps['session']) {
  /**
   * When true, version number display more info about build / platform / override / etc
   */
  const [isVersionDetailsShown, setIsVersionDetailsShown] = React.useState<boolean>(false);

  const toggleVersionDetails = React.useCallback(() => {
    setIsVersionDetailsShown(oldState => !oldState);
  }, []);

  const currentPlatform = session?.platform.displayName;

  return React.useMemo(() => {
    return (
      <TouchableOpacity onLongPress={toggleVersionDetails}>
        <SmallBoldText style={styles.versionButton}>
          {I18n.t('version-number')} {useVersionFeature.versionNumber}
          {isVersionDetailsShown ? ` ${useVersionFeature.versionType} (${useVersionFeature.buildNumber})` : null}
        </SmallBoldText>
        {isVersionDetailsShown ? (
          <SmallBoldText style={styles.versionButton}>
            {isVersionDetailsShown ? `${useVersionFeature.versionOverride} ${currentPlatform}` : null}
          </SmallBoldText>
        ) : null}
      </TouchableOpacity>
    );
  }, [currentPlatform, isVersionDetailsShown, toggleVersionDetails]);
}
// All these values are compile-time constants. So we decalre them as function statics.
useVersionFeature.versionNumber = DeviceInfo.getVersion();
useVersionFeature.buildNumber = DeviceInfo.getBuildNumber();
useVersionFeature.versionType = RNConfigReader.BundleVersionType as string;
useVersionFeature.versionOverride = RNConfigReader.BundleVersionOverride as string;

/**
 * UserHomeScreen component
 * @param props
 * @returns
 */
function UserHomeScreen(props: UserHomeScreenPrivateProps) {
  const { handleLogout, session } = props;

  const navBarDecoration = useCurvedNavBarFeature();
  const avatarButton = useProfileAvatarFeature(session);
  const logoutButton = useLogoutFeature(handleLogout);
  const versionButton = useVersionFeature(session);

  return (
    <PageView style={styles.page} showNetworkBar={false}>
      <ScrollView style={UI_STYLES.flex1} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionUserInfo}>
          {navBarDecoration}
          {avatarButton}
        </View>
        <View style={styles.sectionBottom}>
          {logoutButton}
          {versionButton}
        </View>
      </ScrollView>
    </PageView>
  );
}

export default connect(
  (state: IGlobalState) => {
    return {
      session: getSession(state),
    };
  },
  dispatch =>
    bindActionCreators(
      {
        handleLogout: tryAction(logoutAction) as unknown as UserHomeScreenPrivateProps['handleLogout'],
      },
      dispatch,
    ),
)(UserHomeScreen);
