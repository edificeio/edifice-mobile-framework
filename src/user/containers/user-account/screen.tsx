import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import RNConfigReader from 'react-native-config-reader';
import DeviceInfo from 'react-native-device-info';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { LineButton } from '~/framework/components/buttons/line';
import { ButtonLineGroup } from '~/framework/components/buttons/line/component';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyBoldText, HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';
import { getMFAValidationInfos, getUserRequirements } from '~/framework/modules/auth/service';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { formatSource } from '~/framework/util/media';
import { containsValue } from '~/framework/util/object';
import { getUserSession } from '~/framework/util/session';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { OAuth2RessourceOwnerPasswordClient } from '~/infra/oauth';
import { Avatar, Size } from '~/ui/avatars/Avatar';
import { logout } from '~/user/actions/login';
import { isXmasDateLimitCrossed } from '~/user/actions/xmas';

import styles from './styles';
import { ModificationType, UserAccountScreenProps, UserAccountScreenState } from './types';

export class UserAccountScreen extends React.PureComponent<UserAccountScreenProps, UserAccountScreenState> {
  public state = {
    showVersionType: false,
    updatingAvatar: false,
    versionOverride: RNConfigReader.BundleVersionOverride,
    versionType: RNConfigReader.BundleVersionType,
    avatarPhoto: undefined,
    loadingMFARequirement: {
      email: false,
      mobile: false,
      password: false,
    },
  };

  showWhoAreWe = this.props.session.platform.showWhoAreWe;

  URISource = this.props.userinfo.photo && formatSource(`${DEPRECATED_getCurrentPlatform()!.url}${this.props.userinfo.photo}`);
  // FIXME (Hack): we need to add a variable param to force the call on Android for each session
  // (otherwise, a previously-loaded image is retrieved from cache)

  sourceWithParam = this.URISource && {
    ...this.URISource,
    uri: `${
      this.URISource && this.URISource.uri
    }?uti=${OAuth2RessourceOwnerPasswordClient.connection?.getUniqueSessionIdentifier()}`,
  };

  // SVG size management
  headerWidth = UI_SIZES.screen.width;

  headerHeight = Math.ceil(this.headerWidth * (545 / 375));

  headerTop = Math.ceil(54 * (this.headerWidth / 375)) - this.headerHeight;

  public onDisconnect = () => {
    Alert.alert('', I18n.t('auth-disconnectConfirm'), [
      {
        text: I18n.t('common.cancel'),
        style: 'default',
      },
      {
        text: I18n.t('directory-disconnectButton'),
        style: 'destructive',
        onPress: () => this.props.onLogout(),
      },
    ]);
  };

  public getMFARequirementAndRedirect = async (modificationType: ModificationType) => {
    try {
      this.setState({ loadingMFARequirement: { ...this.state.loadingMFARequirement, [modificationType]: true } });
      const requirements = await getUserRequirements(platform);
      const needMfa = requirements?.needMfa;
      if (needMfa) await getMFAValidationInfos();
      const routeNames = {
        [ModificationType.EMAIL]: 'UserEmail',
        [ModificationType.MOBILE]: 'UserMobile',
        [ModificationType.PASSWORD]: 'ChangePassword',
      };
      const routeName = needMfa ? 'MFA' : routeNames[modificationType];
      const params = {
        [ModificationType.EMAIL]: {
          navBarTitle: I18n.t('user.page.editEmail'),
          modificationType: ModificationType.EMAIL,
        },
        [ModificationType.MOBILE]: {
          navBarTitle: I18n.t('user.page.editMobile'),
          modificationType: ModificationType.MOBILE,
        },
        [ModificationType.PASSWORD]: {
          navBarTitle: I18n.t('user.page.editPassword'),
          modificationType: ModificationType.PASSWORD,
        },
      };
      const routeParams = params[modificationType];
      this.props.navigation.navigate(routeName, routeParams);
    } catch {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    } finally {
      this.setState({ loadingMFARequirement: { ...this.state.loadingMFARequirement, [modificationType]: false } });
    }
  };

  public render() {
    const { navigation, userinfo, session } = this.props;
    const { loadingMFARequirement, showVersionType, versionOverride, versionType } = this.state;
    const isNotStudent = session.user.type !== 'Student';
    const isLoadingMFARequirement = containsValue(loadingMFARequirement, true);

    navigation.addListener('didFocus', () => {
      this.setState({
        avatarPhoto:
          getUserSession().user.photo && formatSource(`${DEPRECATED_getCurrentPlatform()!.url}${getUserSession().user.photo}`),
      });
    });

    return (
      <PageView
        style={styles.page}
        navigation={navigation}
        showNetworkBar={false}
        navBar={{
          title: I18n.t('MyAccount'),
        }}>
        <ScrollView style={styles.main} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
          <View style={styles.userInfo}>
            <NamedSVG
              width={this.headerWidth}
              height={this.headerHeight}
              style={[styles.svgHeader, { top: this.headerTop }]}
              fill={theme.palette.primary.regular}
              name="userpage-header"
            />
            {userinfo.photo === '' ? (
              <TouchableOpacity onPress={() => navigation.navigate('MyProfile')}>
                <Avatar sourceOrId={this.state.avatarPhoto} size={Size.verylarge} id="" />
              </TouchableOpacity>
            ) : (
              <Avatar sourceOrId={this.state.avatarPhoto} size={Size.verylarge} id="" />
            )}
            <BodyBoldText style={styles.userInfo_name}>{userinfo.displayName}</BodyBoldText>
            <SmallText style={styles.userInfo_type}>{I18n.t(`profileTypes.${session.user.type}`)}</SmallText>
            <ActionButton
              text={I18n.t('user.page.userFileButton')}
              type="secondary"
              action={() => {
                navigation.navigate('MyProfile');
              }}
              style={styles.userInfo_button}
            />
          </View>
          <View style={styles.section}>
            <HeadingSText style={styles.titleSection}>{I18n.t('user.page.configuration')}</HeadingSText>
            <ButtonLineGroup>
              <LineButton title="directory-notificationsTitle" onPress={() => navigation.navigate('NotifPrefs')} />
              <LineButton
                loading={loadingMFARequirement.password}
                disabled={isLoadingMFARequirement}
                title="user.page.editPassword"
                onPress={() => this.getMFARequirementAndRedirect(ModificationType.PASSWORD)}
              />
              {isNotStudent ? (
                <LineButton
                  loading={loadingMFARequirement.email}
                  disabled={isLoadingMFARequirement}
                  title="user.page.editEmail"
                  onPress={() => this.getMFARequirementAndRedirect(ModificationType.EMAIL)}
                />
              ) : null}
              {isNotStudent ? (
                <LineButton
                  loading={loadingMFARequirement.mobile}
                  disabled={isLoadingMFARequirement}
                  title="user.page.editMobile"
                  onPress={() => this.getMFARequirementAndRedirect(ModificationType.MOBILE)}
                />
              ) : null}
              <LineButton title="directory-structuresTitle" onPress={() => navigation.navigate('Structures')} />
              {session.user.type === 'Student' ? (
                <LineButton title="directory-relativesTitle" onPress={() => navigation.navigate('Relatives')} />
              ) : session.user.type === 'Relative' ? (
                <LineButton title="directory-childrenTitle" onPress={() => navigation.navigate('Children')} />
              ) : null}
              {!isXmasDateLimitCrossed ? (
                <LineButton title="directory-xmasTitle" onPress={() => navigation.navigate('Xmas')} />
              ) : null}
            </ButtonLineGroup>
          </View>
          <View style={[styles.section, styles.sectionLast]}>
            <HeadingSText style={styles.titleSection}>{I18n.t('user.page.others')}</HeadingSText>
            <ButtonLineGroup>
              {this.showWhoAreWe ? (
                <LineButton title="directory-whoAreWeTitle" onPress={() => navigation.navigate('WhoAreWe')} />
              ) : null}
              <LineButton title="directory-legalNoticeTitle" onPress={() => navigation.navigate('LegalNotice')} />
            </ButtonLineGroup>
          </View>
          <View style={styles.boxBottomPage}>
            <SmallBoldText style={styles.linkDisconnect} onPress={() => this.onDisconnect()}>
              {I18n.t('directory-disconnectButton')}
            </SmallBoldText>
            <SmallBoldText style={styles.textVersion} onLongPress={() => this.setState({ showVersionType: !showVersionType })}>
              {I18n.t('version-number')} {DeviceInfo.getVersion()}
              {showVersionType
                ? `-(${DeviceInfo.getBuildNumber()})-${versionType}-${versionOverride}\n${
                    DEPRECATED_getCurrentPlatform()!.displayName
                  }`
                : ''}
            </SmallBoldText>
          </View>
        </ScrollView>
      </PageView>
    );
  }
}

const UserAccountPageConnected = connect(
  (state: any) => {
    const ret = {
      userinfo: state.user.info,
      session: getUserSession(),
    };
    return ret;
  },
  (dispatch: ThunkDispatch<any, any, any>) => ({
    onLogout: () => dispatch<any>(logout()),
  }),
)(UserAccountScreen);

export default withViewTracking('user')(UserAccountPageConnected);
