import I18n from 'i18n-js';
import * as React from 'react';
import { ScrollView } from 'react-native';
import RNConfigReader from 'react-native-config-reader';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { PageView } from '~/framework/components/page';
import { SmallText } from '~/framework/components/text';
import workspaceService from '~/framework/modules/workspace/service';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { LocalFile, SyncedFile } from '~/framework/util/fileHandler';
import { IUserSession, UserType, getUserSession } from '~/framework/util/session';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { pickFileError } from '~/infra/actions/pickFile';
import { ImagePicked } from '~/infra/imagePicker';
import { notifierShowAction } from '~/infra/notifier/actions';
import Notifier from '~/infra/notifier/container';
import { OAuth2RessourceOwnerPasswordClient, signURISource } from '~/infra/oauth';
import { ButtonLine, ContainerSpacer, ContainerView } from '~/ui/ButtonLine';
import { ButtonsOkCancel } from '~/ui/ButtonsOkCancel';
import { ModalBox, ModalContent, ModalContentBlock, ModalContentText } from '~/ui/Modal';
import { logout } from '~/user/actions/login';
import { profileUpdateAction } from '~/user/actions/profile';
import { UserCard } from '~/user/components/UserCard';
import { IUserInfoState } from '~/user/state/info';

const uploadAvatarError = () => {
  return dispatch => {
    dispatch(
      notifierShowAction({
        id: 'profileOne',
        text: I18n.t('ProfileChangeAvatarErrorUpload'),
        icon: 'close',
        type: 'error',
      }),
    );
    Trackers.trackEvent('Profile', 'UPDATE ERROR', 'AvatarChangeError');
  };
};

// tslint:disable-next-line:max-classes-per-file
export class UserPage extends React.PureComponent<
  {
    onLogout: () => Promise<void>;
    onUploadAvatar: (avatar: LocalFile) => Promise<SyncedFile>;
    onUpdateAvatar: (uploadedAvatarUrl: string) => Promise<void>;
    onPickFileError: (notifierId: string) => void;
    onUploadAvatarError: () => void;
    userinfo: IUserInfoState;
    session: IUserSession;
    navigation: any;
  },
  {
    showDisconnect: boolean;
    showVersionType: boolean;
    updatingAvatar: boolean;
    versionOverride: string;
    versionType: string;
  }
> {
  public state = {
    showDisconnect: false,
    showVersionType: false,
    updatingAvatar: false,
    versionOverride: RNConfigReader.BundleVersionOverride,
    versionType: RNConfigReader.BundleVersionType,
  };

  public disconnect() {
    this.setState({ showDisconnect: false });
    this.props.onLogout();
  }

  public disconnectBox = () => (
    <ModalContent>
      <ModalContentBlock>
        <ModalContentText>
          {I18n.t('common-confirm')}
          {'\n'}
          {I18n.t('auth-disconnectConfirm')}
        </ModalContentText>
      </ModalContentBlock>
      <ModalContentBlock>
        <ButtonsOkCancel
          onCancel={() => this.setState({ showDisconnect: false })}
          onValid={() => this.disconnect()}
          title={I18n.t('directory-disconnectButton')}
        />
      </ModalContentBlock>
    </ModalContent>
  ); // TS-ISSUE

  public async onChangeAvatar(image: ImagePicked) {
    const { onUploadAvatar, onUpdateAvatar, onPickFileError, onUploadAvatarError } = this.props;
    // setTimeout(async () => {
    try {
      const lc = new LocalFile(
        {
          filename: image.fileName as string,
          filepath: image.uri as string,
          filetype: image.type as string,
        },
        { _needIOSReleaseSecureAccess: false },
      );
      this.setState({ updatingAvatar: true });
      const sc = await onUploadAvatar(lc);
      await onUpdateAvatar(sc.url);
    } catch (err: any) {
      if (err.message === 'Error picking image') {
        onPickFileError('profileOne');
      } else if (!(err instanceof Error)) {
        onUploadAvatarError();
      }
    } finally {
      this.setState({ updatingAvatar: false });
    }
    //}, 0);
    /*try {
      const lc = new LocalFile(
        {
          filename: image.fileName as string,
          filepath: image.uri as string,
          filetype: image.type as string,
        },
        { _needIOSReleaseSecureAccess: false },
      );
      this.setState({ updatingAvatar: true });
      onUploadAvatar(lc)
        .then(sc => {
          onUpdateAvatar(sc.url)
            .then(() => {
              this.setState({ updatingAvatar: false });
            })
            .catch((updateError: Error) => {
              throw updateError;
            });
        })
        .catch((uploadError: Error) => {
          throw uploadError;
        });
    } catch (err: any) {
      const { onUploadAvatar, onUpdateAvatar, onPickFileError, onUploadAvatarError } = this.props;
      if (err.message === 'Error picking image') {
        onPickFileError('profileOne');
      } else if (!(err instanceof Error)) {
        onUploadAvatarError();
      }
      this.setState({ updatingAvatar: false });
    }*/
  }

  public async onDeleteAvatar() {
    const { onUpdateAvatar } = this.props;
    // setTimeout(async () => {
    try {
      this.setState({ updatingAvatar: true });
      await onUpdateAvatar('');
    } finally {
      this.setState({ updatingAvatar: false });
    }
    //}, 0);
    /*try {
      this.setState({ updatingAvatar: true });
      onUpdateAvatar('')
        .then(() => {
          this.setState({ updatingAvatar: false });
        })
        .catch((deleteError: Error) => {
          throw deleteError;
        });
    } finally {
      this.setState({ updatingAvatar: false });
    }*/
  }

  public render() {
    //avoid setstate on modalbox when unmounted
    const { userinfo, session } = this.props;
    const { showDisconnect, showVersionType, versionOverride, versionType, updatingAvatar } = this.state;
    const signedURISource = userinfo.photo && signURISource(`${DEPRECATED_getCurrentPlatform()!.url}${userinfo.photo}`);
    // FIXME (Hack): we need to add a variable param to force the call on Android for each session
    // (otherwise, a previously-loaded image is retrieved from cache)
    const sourceWithParam = signedURISource && {
      ...signedURISource,
      uri: `${
        signedURISource && signedURISource.uri
      }?uti=${OAuth2RessourceOwnerPasswordClient.connection?.getUniqueSessionIdentifier()}`,
    };
    const showWhoAreWe = session.platform.showWhoAreWe;

    return (
      <PageView
        navigation={this.props.navigation}
        navBar={{
          title: I18n.t('MyAccount'),
        }}>
        <ScrollView style={{ flex: 1 }} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
          <Notifier id="profileOne" />
          {showDisconnect && (
            <ModalBox backdropOpacity={0.5} isVisible={showDisconnect}>
              {this.disconnectBox()}
            </ModalBox>
          )}
          <UserCard
            canEdit
            hasAvatar={userinfo.photo !== ''}
            updatingAvatar={updatingAvatar}
            onChangeAvatar={this.onChangeAvatar.bind(this)}
            onDeleteAvatar={this.onDeleteAvatar.bind(this)}
            id={sourceWithParam}
            displayName={session.user.displayName}
            type={session.user.type as keyof typeof UserType}
            touchable
            onPress={() => this.props.navigation.navigate('MyProfile')}
          />
          <ContainerSpacer />
          <ButtonLine title="directory-structuresTitle" onPress={() => this.props.navigation.navigate('Structures')} />
          <ContainerSpacer />
          {session.user.type === 'Student' ? (
            <>
              <ButtonLine title="directory-relativesTitle" onPress={() => this.props.navigation.navigate('Relatives')} />
              <ContainerSpacer />
            </>
          ) : session.user.type === 'Relative' ? (
            <>
              <ButtonLine title="directory-childrenTitle" onPress={() => this.props.navigation.navigate('Children')} />
              <ContainerSpacer />
            </>
          ) : null}
          <ButtonLine title="directory-notificationsTitle" onPress={() => this.props.navigation.navigate('NotifPrefs')} />
          <ContainerSpacer />
          {showWhoAreWe ? (
            <>
              <ButtonLine title={'directory-whoAreWeTitle'} onPress={() => this.props.navigation.navigate('WhoAreWe')} />
              <ContainerSpacer />
            </>
          ) : null}
          <ButtonLine title="directory-legalNoticeTitle" onPress={() => this.props.navigation.navigate('LegalNotice')} />
          <ContainerSpacer />
          <ContainerView>
            <SmallText
              style={{ color: theme.ui.text.light, textAlignVertical: 'center' }}
              onLongPress={() => this.setState({ showVersionType: !showVersionType })}>
              {I18n.t('version-number')} {DeviceInfo.getVersion()}
              {showVersionType ? `-(${DeviceInfo.getBuildNumber()})-${versionType}-${versionOverride}` : ''}
            </SmallText>
          </ContainerView>
          <ContainerSpacer />
          <ButtonLine
            title="directory-disconnectButton"
            hideIcon
            color={theme.palette.complementary.red.regular}
            onPress={() => this.setState({ showDisconnect: true })}
          />
        </ScrollView>
      </PageView>
    );
  }
}

const uploadAvatarAction = (avatar: LocalFile) => async (_dispatch: Dispatch, getState: () => IGlobalState) => {
  return await workspaceService.uploadFile(getUserSession(), avatar, {});
};

const UserPageConnected = connect(
  (state: any) => {
    const ret = {
      userinfo: state.user.info,
      session: getUserSession(),
    };
    return ret;
  },
  (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => ({
    onLogout: () => dispatch<any>(logout()),
    onPickFileError: (notifierId: string) => dispatch(pickFileError(notifierId)),
    onUploadAvatarError: () => dispatch(uploadAvatarError()),
    onUploadAvatar: (avatar: LocalFile) => dispatch(uploadAvatarAction(avatar)),
    onUpdateAvatar: (imageWorkspaceUrl: string) =>
      dispatch(profileUpdateAction({ picture: imageWorkspaceUrl }, true)) as unknown as Promise<void>,
  }),
)(UserPage);

export default withViewTracking('user')(UserPageConnected);
