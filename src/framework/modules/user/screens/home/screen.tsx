import { useHeaderHeight } from '@react-navigation/elements';
import { CommonActions, NavigationProp, useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { Alert, ImageURISource, TouchableOpacity, View } from 'react-native';
import RNConfigReader from 'react-native-config-reader';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import { ButtonLineGroup, LineButton } from '~/framework/components/buttons/line';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import { HeadingSText, HeadingXSText, SmallBoldText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { logoutAction } from '~/framework/modules/auth/actions';
import { IAuthContext } from '~/framework/modules/auth/model';
import { authRouteNames } from '~/framework/modules/auth/navigation';
import { getSession } from '~/framework/modules/auth/reducer';
import { AuthChangeEmailScreenNavParams } from '~/framework/modules/auth/screens/change-email/types';
import { AuthChangeMobileScreenNavParams } from '~/framework/modules/auth/screens/change-mobile/types';
import { ChangePasswordScreenNavParams } from '~/framework/modules/auth/screens/change-password/types';
import { AuthMFAScreenNavParams } from '~/framework/modules/auth/screens/mfa/types';
import { UserType, getAuthContext, getMFAValidationInfos, getUserRequirements } from '~/framework/modules/auth/service';
import { isWithinXmasPeriod } from '~/framework/modules/user/actions';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { formatSource } from '~/framework/util/media';
import { handleAction } from '~/framework/util/redux/actions';
import { OAuth2RessourceOwnerPasswordClient } from '~/infra/oauth';
import Avatar, { Size } from '~/ui/avatars/Avatar';

import { colorType } from '.';
import styles from './styles';
import { ModificationType, UserHomeScreenDispatchProps, UserHomeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('user-profile-myaccount'),
  }),
  headerShadowVisible: false,
});

/**
 * Setup a fancy navBar decoration feature
 * That consists of adding a svg as a background that scroll with the page content
 * @returns the React Element of the decoration
 */
function useCurvedNavBarFeature() {
  const navBarHeight = useHeaderHeight() - UI_SIZES.screen.topInset;
  // SVG size management
  const svgDisplayWidth = UI_SIZES.screen.width;
  const svgDisplayHeight = Math.ceil(
    svgDisplayWidth * (useCurvedNavBarFeature.svgOriginalHeight / useCurvedNavBarFeature.svgOriginalWidth),
  );
  const svgDisplayTopOffset =
    Math.ceil(navBarHeight * (svgDisplayWidth / useCurvedNavBarFeature.svgOriginalWidth)) -
    svgDisplayHeight +
    UI_SIZES.elements.statusbarHeight;
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
        <Avatar sourceOrId={userProfilePicture} size={Size.xxl} id="" />
      </TouchableOpacity>
    ) : (
      <Avatar sourceOrId={userProfilePicture} size={Size.xxl} id="" />
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
        <HeadingXSText style={styles.userInfoName}>{session?.user.displayName}</HeadingXSText>
        <SmallBoldText style={{ color: colorType[session?.user.type!] }}>
          {I18n.get(`user-profiletypes-${session?.user.type}`.toLowerCase())}
        </SmallBoldText>
        <SecondaryButton
          text={I18n.get('user-page-userfilebutton')}
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
function useAccountMenuFeature(session: UserHomeScreenPrivateProps['session'], focusedRef: React.MutableRefObject<boolean>) {
  const navigation = useNavigation<NavigationProp<UserNavigationParams>>();
  const [currentLoadingMenu, setCurrentLoadingMenu] = React.useState<ModificationType | undefined>(undefined);
  const authContextRef = React.useRef<IAuthContext | undefined>(undefined);
  const fetchAuthContext = React.useCallback(async () => {
    if (!session) return;
    if (!authContextRef.current) authContextRef.current = await getAuthContext(session.platform);
    return authContextRef.current;
  }, [session]);
  const fetchMFAValidationInfos = React.useCallback(async () => {
    const requirements = await getUserRequirements(session?.platform!);
    const needMfa = requirements?.needMfa;
    if (needMfa) await getMFAValidationInfos();
    return needMfa;
  }, [session]);
  const editUserInformation = React.useCallback(
    async (modificationType: ModificationType) => {
      try {
        setCurrentLoadingMenu(modificationType);
        if (!(await fetchAuthContext())) throw new Error('No session');
        let needMfa: undefined | boolean;
        if (modificationType !== ModificationType.PASSWORD) needMfa = await fetchMFAValidationInfos();
        const routeNames = {
          [ModificationType.EMAIL]: authRouteNames.changeEmail,
          [ModificationType.MOBILE]: authRouteNames.changeMobile,
          [ModificationType.PASSWORD]: authRouteNames.changePasswordModal,
        };
        let routeName = routeNames[modificationType];
        const params = {
          [ModificationType.EMAIL]: {
            navBarTitle: I18n.get('user-page-editemail'),
            modificationType: ModificationType.EMAIL,
            platform: session?.platform,
          } as AuthMFAScreenNavParams | AuthChangeEmailScreenNavParams,
          [ModificationType.MOBILE]: {
            navBarTitle: I18n.get('user-page-editmobile'),
            modificationType: ModificationType.MOBILE,
            platform: session?.platform,
          } as AuthMFAScreenNavParams | AuthChangeMobileScreenNavParams,
          [ModificationType.PASSWORD]: {
            platform: session?.platform,
            context: authContextRef?.current,
            credentials: { username: session?.user.login },
            navCallback: CommonActions.goBack(),
          } as ChangePasswordScreenNavParams,
        };
        const routeParams = params[modificationType];
        if (needMfa) {
          (routeParams as AuthMFAScreenNavParams).mfaRedirectionRoute = routeName;
          routeName = authRouteNames.mfaModal;
        }
        setCurrentLoadingMenu(undefined);
        if (focusedRef.current) navigation.navigate(routeName, routeParams);
      } catch {
        setCurrentLoadingMenu(undefined);
        Toast.showError(I18n.get('user-page-error-text'));
      }
    },
    [fetchAuthContext, fetchMFAValidationInfos, focusedRef, navigation, session?.platform, session?.user.login],
  );
  const canEditPersonalInfo = session?.user.type !== UserType.Student;
  const showWhoAreWe = session?.platform.showWhoAreWe;
  const isFederated = session?.federated;
  return React.useMemo(
    () => (
      <>
        <View style={styles.section}>
          <HeadingSText style={styles.sectionTitle}>{I18n.get('user-page-configuration')}</HeadingSText>
          <ButtonLineGroup>
            <LineButton
              title={I18n.get('user-pushnotifssettings-title')}
              onPress={() => {
                navigation.navigate(userRouteNames.notifPrefs, {});
              }}
            />
            {!isFederated ? (
              <LineButton
                loading={currentLoadingMenu === ModificationType.PASSWORD}
                disabled={!!currentLoadingMenu}
                title={I18n.get('user-page-editpassword')}
                onPress={() => editUserInformation(ModificationType.PASSWORD)}
              />
            ) : null}
            {canEditPersonalInfo ? (
              <>
                <LineButton
                  loading={currentLoadingMenu === ModificationType.EMAIL}
                  disabled={!!currentLoadingMenu}
                  title={I18n.get('user-page-editemail')}
                  onPress={() => editUserInformation(ModificationType.EMAIL)}
                />
                <LineButton
                  loading={currentLoadingMenu === ModificationType.MOBILE}
                  disabled={!!currentLoadingMenu}
                  title={I18n.get('user-page-editmobile')}
                  onPress={() => editUserInformation(ModificationType.MOBILE)}
                />
              </>
            ) : null}
            <LineButton
              disabled={!!currentLoadingMenu}
              title={I18n.get('user-page-editlang')}
              onPress={() => navigation.navigate(userRouteNames.lang, {})}
            />
          </ButtonLineGroup>
        </View>
        <View style={[styles.section, styles.sectionLast]}>
          <HeadingSText style={styles.sectionTitle}>{I18n.get('user-page-others')}</HeadingSText>
          <ButtonLineGroup>
            {isWithinXmasPeriod ? (
              <LineButton
                title={I18n.get('user-xmas-title')}
                onPress={() => {
                  navigation.navigate(userRouteNames.xmas, {});
                }}
              />
            ) : null}
            {showWhoAreWe ? (
              <LineButton
                title={I18n.get('user-whoarewe-title')}
                onPress={() => {
                  navigation.navigate(userRouteNames.whoAreWe, {});
                }}
              />
            ) : null}
            <LineButton
              title={I18n.get('user-legalnotice-title')}
              onPress={() => {
                navigation.navigate(userRouteNames.legalNotice, {});
              }}
            />
          </ButtonLineGroup>
        </View>
      </>
    ),
    [currentLoadingMenu, canEditPersonalInfo, showWhoAreWe, navigation, editUserInformation],
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
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const logout = React.useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await handleLogout();
    } catch {
      Toast.showError(I18n.get('user-page-error-text'));
    } finally {
      setIsLoggingOut(false);
    }
  }, [handleLogout]);
  const doLogout = React.useCallback(() => {
    Alert.alert('', I18n.get('auth-disconnect-confirm'), [
      {
        text: I18n.get('common-cancel'),
        style: 'default',
      },
      {
        text: I18n.get('user-page-disconnect'),
        style: 'destructive',
        onPress: logout,
      },
    ]);
  }, [logout]);
  /**
   * renders the logout button
   */
  return React.useMemo(() => {
    return (
      <DefaultButton
        text={I18n.get('user-page-disconnect')}
        contentColor={theme.palette.status.failure.regular}
        action={doLogout}
        loading={isLoggingOut}
      />
    );
  }, [doLogout, isLoggingOut]);
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
          {I18n.get('user-page-versionnumber')} {useVersionFeature.versionNumber}
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

  // Manages focus to send to others features in this screen.
  // We must store it in a Ref because of async operations
  const focusedRef = React.useRef(useIsFocused());
  useFocusEffect(
    React.useCallback(() => {
      focusedRef.current = true;
      return () => {
        focusedRef.current = false;
      };
    }, []),
  );

  const navBarDecoration = useCurvedNavBarFeature();
  const avatarButton = useProfileAvatarFeature(session);
  const profileMenu = useProfileMenuFeature(session);
  const accountMenu = useAccountMenuFeature(session, focusedRef);
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
