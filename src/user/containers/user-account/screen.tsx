import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, ImageURISource, ScrollView, TouchableOpacity, View } from 'react-native';
import RNConfigReader from 'react-native-config-reader';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { LineButton } from '~/framework/components/buttons/line';
import { ButtonLineGroup } from '~/framework/components/buttons/line/component';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyBoldText, HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { formatSource } from '~/framework/util/media';
import { IUserSession, getUserSession } from '~/framework/util/session';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { OAuth2RessourceOwnerPasswordClient } from '~/infra/oauth';
import { Avatar, Size } from '~/ui/avatars/Avatar';
import { logout } from '~/user/actions/login';
import { IUserInfoState } from '~/user/state/info';

import { isXmasDateLimitCrossed } from '../../actions/xmas';
import styles from './styles';

export class UserAccountScreen extends React.PureComponent<
  {
    onLogout: () => Promise<void>;
    userinfo: IUserInfoState;
    session: IUserSession;
    navigation: any;
  },
  {
    showVersionType: boolean;
    updatingAvatar: boolean;
    versionOverride: string;
    versionType: string;
    avatarPhoto?: '' | ImageURISource;
  }
> {
  public state = {
    showVersionType: false,
    updatingAvatar: false,
    versionOverride: RNConfigReader.BundleVersionOverride,
    versionType: RNConfigReader.BundleVersionType,
    avatarPhoto: undefined,
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

  public render() {
    const { userinfo, session } = this.props;
    const { showVersionType, versionOverride, versionType } = this.state;
    this.props.navigation.addListener('didFocus', () => {
      this.setState({
        avatarPhoto:
          getUserSession().user.photo && formatSource(`${DEPRECATED_getCurrentPlatform()!.url}${getUserSession().user.photo}`),
      });
    });

    return (
      <PageView
        style={styles.page}
        navigation={this.props.navigation}
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
              <TouchableOpacity onPress={() => this.props.navigation.navigate('MyProfile')}>
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
                this.props.navigation.navigate('MyProfile');
              }}
              style={styles.userInfo_button}
            />
          </View>
          <View style={styles.section}>
            <HeadingSText style={styles.titleSection}>{I18n.t('user.page.configuration')}</HeadingSText>
            <ButtonLineGroup>
              <LineButton title="directory-notificationsTitle" onPress={() => this.props.navigation.navigate('NotifPrefs')} />
              <LineButton title="user.page.editPassword" onPress={() => this.props.navigation.navigate('ChangePassword')} />
              {session.user.type !== 'Student' ? (
                <LineButton
                  title="user.page.editEmail"
                  onPress={() => this.props.navigation.navigate('SendEmailVerificationCode', { isModifyingEmail: true })}
                />
              ) : null}
              <LineButton title="directory-structuresTitle" onPress={() => this.props.navigation.navigate('Structures')} />
              {session.user.type === 'Student' ? (
                <LineButton title="directory-relativesTitle" onPress={() => this.props.navigation.navigate('Relatives')} />
              ) : session.user.type === 'Relative' ? (
                <LineButton title="directory-childrenTitle" onPress={() => this.props.navigation.navigate('Children')} />
              ) : null}
              {!isXmasDateLimitCrossed ? (
                <LineButton title="directory-xmasTitle" onPress={() => this.props.navigation.navigate('Xmas')} />
              ) : null}
            </ButtonLineGroup>
          </View>
          <View style={[styles.section, styles.sectionLast]}>
            <HeadingSText style={styles.titleSection}>{I18n.t('user.page.others')}</HeadingSText>
            <ButtonLineGroup>
              {this.showWhoAreWe ? (
                <LineButton title="directory-whoAreWeTitle" onPress={() => this.props.navigation.navigate('WhoAreWe')} />
              ) : null}
              <LineButton title="directory-legalNoticeTitle" onPress={() => this.props.navigation.navigate('LegalNotice')} />
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
