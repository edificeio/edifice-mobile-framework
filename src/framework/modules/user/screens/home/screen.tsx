import { useHeaderHeight } from '@react-navigation/elements';
import { NavigationProp, useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, ImageURISource, ScrollView, TouchableOpacity, View } from 'react-native';
import RNConfigReader from 'react-native-config-reader';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import ActionButton from '~/framework/components/buttons/action';
import { ButtonLineGroup, LineButton } from '~/framework/components/buttons/line/component';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyBoldText, HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';
import { logoutAction } from '~/framework/modules/auth/actions';
import { IAuthContext } from '~/framework/modules/auth/model';
import { AuthRouteNames } from '~/framework/modules/auth/navigation';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType, getAuthContext } from '~/framework/modules/auth/service';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { formatSource } from '~/framework/util/media';
import { handleAction, tryActionLegacy } from '~/framework/util/redux/actions';
import { OAuth2RessourceOwnerPasswordClient } from '~/infra/oauth';
import Avatar, { Size } from '~/ui/avatars/Avatar';

import styles from './styles';
import { ModificationType, UserHomeScreenDispatchProps, UserHomeScreenPrivateProps } from './types';

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
 * Setup the menu for Profile section of Account screen
 * @param session
 * @returns the React Element of the menu
 */
function useProfileMenuFeature(session: UserHomeScreenPrivateProps['session']) {
  const navigation = useNavigation<NavigationProp<UserNavigationParams>>();
  return React.useMemo(
    () => (
      <>
        <BodyBoldText style={styles.userInfoName}>{session?.user.displayName}</BodyBoldText>
        <SmallText style={styles.userInfoType}>{I18n.t(`profileTypes.${session?.user.type}`)}</SmallText>
        <ActionButton
          text={I18n.t('user.page.userFileButton')}
          type="secondary"
          action={() => {
            navigation.navigate(userRouteNames.profile, {});
          }}
          style={styles.userInfoButton}
        />
      </>
    ),
    [navigation, session?.user.displayName, session?.user.type],
  );
}

/**
 * Setup the menu for Account screen
 * @param session
 * @returns the React Element of the menus
 */
function useAccountMenuFeature(session: UserHomeScreenPrivateProps['session']) {
  const navigation = useNavigation<NavigationProp<UserNavigationParams>>();
  const [currentLoadingMenu, setCurrentLoadingMenu] = React.useState<ModificationType | undefined>(undefined);
  const authContextRef = React.useRef<IAuthContext | undefined>(undefined);
  const isFocused = useIsFocused();

  const fetchAuthContext = React.useCallback(async () => {
    if (!session) return;
    if (!authContextRef.current) {
      authContextRef.current = await getAuthContext(session.platform);
    }
    return authContextRef.current;
  }, [session]);

  const doLoadChangePassword = React.useCallback(async () => {
    if (!session) return;
    setCurrentLoadingMenu(ModificationType.PASSWORD);
    // ToDo : manage MFA here instead of direct navigate
    if (!(await fetchAuthContext())) return;
    setCurrentLoadingMenu(undefined);
    if (isFocused) {
      navigation.navigate(AuthRouteNames.changePassword, { platform: session.platform, context: authContextRef.current });
    }
  }, [fetchAuthContext, isFocused, navigation, session]);

  const doLoadChangeEmail = React.useCallback(async () => {
    if (!session) return;
    setCurrentLoadingMenu(ModificationType.EMAIL);
    // ToDo : manage MFA here instead of direct navigate
    if (!(await fetchAuthContext())) return;
    setCurrentLoadingMenu(undefined);
    if (isFocused) {
      navigation.navigate(AuthRouteNames.changeEmail, { platform: session.platform, context: authContextRef.current });
    }
  }, [fetchAuthContext, isFocused, navigation, session]);

  const doLoadChangeMobile = React.useCallback(async () => {
    if (!session) return;
    setCurrentLoadingMenu(ModificationType.MOBILE);
    // ToDo : manage MFA here instead of direct navigate
    if (!(await fetchAuthContext())) return;
    setCurrentLoadingMenu(undefined);
    if (isFocused) {
      navigation.navigate(AuthRouteNames.changeMobile, { platform: session.platform, context: authContextRef.current });
    }
  }, [fetchAuthContext, isFocused, navigation, session]);

  const canEditPersonalInfo = session?.user.type !== UserType.Student;
  const isStudent = session?.user.type === UserType.Student;
  const isRelative = session?.user.type === UserType.Relative;
  const showWhoAreWe = session?.platform.showWhoAreWe;

  return React.useMemo(
    () => (
      <>
        <View style={styles.section}>
          <HeadingSText style={styles.sectionTitle}>{I18n.t('user.page.configuration')}</HeadingSText>
          <ButtonLineGroup>
            <LineButton
              title="directory-notificationsTitle"
              onPress={() => {
                navigation.navigate(userRouteNames.notifPrefs, {});
              }}
            />
            <LineButton
              loading={currentLoadingMenu === ModificationType.PASSWORD}
              disabled={currentLoadingMenu !== undefined}
              title="user.page.editPassword"
              onPress={doLoadChangePassword}
            />
            {canEditPersonalInfo ? (
              <LineButton
                loading={currentLoadingMenu === ModificationType.EMAIL}
                disabled={currentLoadingMenu !== undefined}
                title="user.page.editEmail"
                onPress={doLoadChangeEmail}
              />
            ) : null}
            {canEditPersonalInfo ? (
              <LineButton
                loading={currentLoadingMenu === ModificationType.MOBILE}
                disabled={currentLoadingMenu !== undefined}
                title="user.page.editMobile"
                onPress={doLoadChangeMobile}
              />
            ) : null}
            <LineButton
              title="directory-structuresTitle"
              onPress={() => {
                navigation.navigate(userRouteNames.structures, {});
              }}
            />
            {isStudent ? (
              <LineButton
                title="directory-relativesTitle"
                onPress={() => {
                  navigation.navigate(userRouteNames.family, { mode: 'relatives' });
                }}
              />
            ) : isRelative ? (
              <LineButton
                title="directory-childrenTitle"
                onPress={() => {
                  navigation.navigate(userRouteNames.family, { mode: 'children' });
                }}
              />
            ) : null}
          </ButtonLineGroup>
        </View>
        <View style={[styles.section, styles.sectionLast]}>
          <HeadingSText style={styles.sectionTitle}>{I18n.t('user.page.others')}</HeadingSText>
          <ButtonLineGroup>
            {showWhoAreWe ? (
              <LineButton
                title="directory-whoAreWeTitle"
                onPress={() => {
                  navigation.navigate(userRouteNames.whoAreWe, {});
                }}
              />
            ) : null}
            <LineButton
              title="directory-legalNoticeTitle"
              onPress={() => {
                navigation.navigate(userRouteNames.legalNotice, {});
              }}
            />
          </ButtonLineGroup>
        </View>
      </>
    ),
    [
      currentLoadingMenu,
      doLoadChangePassword,
      canEditPersonalInfo,
      doLoadChangeEmail,
      doLoadChangeMobile,
      isStudent,
      isRelative,
      showWhoAreWe,
      navigation,
    ],
  );
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
      <TouchableOpacity onPress={doLogout}>
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
            {isVersionDetailsShown ? `${useVersionFeature.versionOverride} – ${currentPlatform}` : null}
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
  const profileMenu = useProfileMenuFeature(session);
  const accountMenu = useAccountMenuFeature(session);
  const logoutButton = useLogoutFeature(handleLogout);
  const versionButton = useVersionFeature(session);

  return (
    <PageView style={styles.page} showNetworkBar={false}>
      <ScrollView style={UI_STYLES.flex1} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionUserInfo}>
          {navBarDecoration}
          {avatarButton}
          {profileMenu}
        </View>
        {accountMenu}
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
      session: getSession(),
    };
  },
  dispatch =>
    bindActionCreators<UserHomeScreenDispatchProps>(
      {
        handleLogout: handleAction(logoutAction),
      },
      dispatch,
    ),
)(UserHomeScreen);
