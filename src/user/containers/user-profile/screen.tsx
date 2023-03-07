import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, KeyboardAvoidingView, KeyboardTypeOptions, Platform, SafeAreaView, ScrollView, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
<<<<<<<< HEAD:src/user/containers/ProfilePage.tsx
========
import { ContainerTextInput, ContainerView } from '~/framework/components/buttons/line';
>>>>>>>> release/1.9.3:src/user/containers/user-profile/screen.tsx
import { UI_SIZES } from '~/framework/components/constants';
import { HeaderAction } from '~/framework/components/header';
import { ImagePicked } from '~/framework/components/menus/actions';
import { PageView } from '~/framework/components/page';
import { CaptionText, SmallText } from '~/framework/components/text';
import workspaceService from '~/framework/modules/workspace/service';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
<<<<<<<< HEAD:src/user/containers/ProfilePage.tsx
import { LocalFile, SyncedFile } from '~/framework/util/fileHandler';
import { formatSource } from '~/framework/util/media';
import { IUserSession, UserType, getUserSession } from '~/framework/util/session';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { pickFileError } from '~/infra/actions/pickFile';
import { ImagePicked } from '~/infra/imagePicker';
import { notifierShowAction } from '~/infra/notifier/actions';
import Notifier from '~/infra/notifier/container';
import { PageContainer } from '~/ui/ContainerContent';
import { ContainerTextInput, ContainerView } from '~/ui/button-line';
import { IUpdatableProfileValues, profileUpdateAction, profileUpdateErrorAction } from '~/user/actions/profile';
import UserCard from '~/user/components/user-card';
import { IUserAuthState } from '~/user/reducers/auth';
import { IUserInfoState } from '~/user/state/info';
========
import { LocalFile } from '~/framework/util/fileHandler';
import { formatSource } from '~/framework/util/media';
import { isEmpty } from '~/framework/util/object';
import { UserType, getUserSession } from '~/framework/util/session';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { pickFileError } from '~/infra/actions/pickFile';
import { notifierShowAction } from '~/infra/notifier/actions';
import Notifier from '~/infra/notifier/container';
import { PageContainer } from '~/ui/ContainerContent';
import { IUpdatableProfileValues, profileUpdateAction, profileUpdateErrorAction } from '~/user/actions/profile';
import UserCard from '~/user/components/user-card';
>>>>>>>> release/1.9.3:src/user/containers/user-profile/screen.tsx
import { ValidatorBuilder } from '~/utils/form';

import styles from './styles';
import { IProfilePageProps, IProfilePageState } from './types';

<<<<<<<< HEAD:src/user/containers/ProfilePage.tsx
export interface IProfilePageEventProps {
  onSave: (updatedProfileValues: IUpdatableProfileValues) => void;
  dispatch: Dispatch;
}

export type IProfilePageProps = IProfilePageDataProps &
  IProfilePageEventProps &
  NavigationInjectedProps & {
    onUploadAvatar: (avatar: LocalFile) => Promise<SyncedFile>;
    onUpdateAvatar: (uploadedAvatarUrl: string) => Promise<void>;
    onPickFileError: (notifierId: string) => void;
    onUploadAvatarError: () => void;
  };

export type IProfilePageState = IUpdatableProfileValues & {
  emailValid?: boolean;
  homePhoneValid?: boolean;
  mobileValid?: boolean;
  loginAliasValid?: boolean;
  updatingAvatar?: boolean;
};

// tslint:disable-next-line:max-classes-per-file
========
>>>>>>>> release/1.9.3:src/user/containers/user-profile/screen.tsx
export class ProfilePage extends React.PureComponent<IProfilePageProps, IProfilePageState> {
  defaultState: (force?: boolean) => IProfilePageState = force => ({
    displayName: this.props.userinfo.displayName,
    homePhone: this.props.userinfo.homePhone,
    homePhoneValid: true,
    loginAlias: this.props.userinfo.loginAlias,
    loginAliasValid: true,
    updatingAvatar: false,
  });

  state = this.defaultState();

  setState(newState: IProfilePageState) {
    super.setState(newState);
    setTimeout(() => {
      this.props.navigation.setParams({
        updatedProfileValues: { ...this.state },
      });
    });
  }

  public async onChangeAvatar(image: ImagePicked) {
    const { onUploadAvatar, onUpdateAvatar, onPickFileError, onUploadAvatarError } = this.props;
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
  }

  public async onDeleteAvatar() {
    const { onUpdateAvatar } = this.props;
    try {
      this.setState({ updatingAvatar: true });
      await onUpdateAvatar('');
    } finally {
      this.setState({ updatingAvatar: false });
    }
  }

  public render() {
    const { userinfo } = this.props;
    const isEditMode = this.props.navigation.getParam('edit', false);
    return (
      <PageContainer>
        <Notifier id="profileOne" />
<<<<<<<< HEAD:src/user/containers/ProfilePage.tsx
========
        <Notifier id="profileTwo" />
>>>>>>>> release/1.9.3:src/user/containers/user-profile/screen.tsx
        <KeyboardAvoidingView
          style={styles.profilePage}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.select({ ios: 100, android: undefined })}>
          <ScrollView alwaysBounceVertical={false} overScrollMode="never">
            <SafeAreaView>
              <UserCard
                id={userinfo.photo && formatSource(`${DEPRECATED_getCurrentPlatform()!.url}${userinfo.photo}`)}
                displayName={userinfo.displayName!}
                type={
                  userinfo.type! as
                    | 'Student'
                    | 'Relative'
                    | 'Teacher'
                    | 'Personnel'
                    | ('Student' | 'Relative' | 'Teacher' | 'Personnel')[]
                }
                canEdit
                hasAvatar={userinfo.photo !== ''}
                updatingAvatar={this.state.updatingAvatar}
                onChangeAvatar={this.onChangeAvatar.bind(this)}
                onDeleteAvatar={this.onDeleteAvatar.bind(this)}
              />
              {this.renderItem({
                title: I18n.t('Login'),
                getter: () => (isEditMode ? this.state.loginAlias : this.state.loginAlias || userinfo.login),
                editable: true,
                setter: loginAlias => this.setState({ loginAlias }),
<<<<<<<< HEAD:src/user/containers/ProfilePage.tsx
                validator: { key: 'loginAliasValid', regex: /^[0-9a-z\-\.]+$/ },
========
                validator: { key: 'loginAliasValid', regex: /^[0-9a-z\-.]+$/ },
>>>>>>>> release/1.9.3:src/user/containers/user-profile/screen.tsx
                placeholder: userinfo.login,
              })}
              {this.renderItem({
                title: I18n.t('Firstname'),
                getter: () => userinfo.firstName,
              })}
              {this.renderItem({
                title: I18n.t('Lastname'),
                getter: () => userinfo.lastName,
              })}
              {this.renderItem({
                title: I18n.t('DisplayName'),
                getter: () => this.state.displayName,
                editable: userinfo.type !== 'Relative',
                setter: displayName => this.setState({ displayName }),
              })}
              {this.renderItem({
                title: I18n.t('EmailAddress'),
                getter: () => userinfo.email,
              })}
              {this.renderItem({
                title: I18n.t('Phone'),
                getter: () => this.state.homePhone,
                editable: true,
                setter: homePhone => this.setState({ homePhone }),
                keyboardType: 'phone-pad',
                validator: { key: 'homePhoneValid', regex: ValidatorBuilder.PHONE_REGEX },
              })}
              {this.renderItem({
                title: I18n.t('CellPhone'),
                getter: () => userinfo.mobile,
              })}
              {this.renderItem({
                title: I18n.t('Birthdate'),
                getter: () =>
                  userinfo.birthDate!.format('L') === 'Invalid date'
                    ? I18n.t('common-InvalidDate')
                    : userinfo.birthDate!.format('L'),
              })}
            </SafeAreaView>
          </ScrollView>
        </KeyboardAvoidingView>
      </PageContainer>
    );
  }

  private renderItem({
    title,
    getter,
    editable = false,
    setter,
    keyboardType,
    validator,
    placeholder,
    placeholderTextColor,
  }: {
    title: string;
    getter: () => string | undefined;
    editable?: boolean;
    setter?: (val: any) => void;
    keyboardType?: KeyboardTypeOptions;
    validator?: { key: keyof IProfilePageState; regex: RegExp };
    placeholder?: string;
    placeholderTextColor?: string;
  }) {
    const isEditMode = this.props.navigation.getParam('edit', false);
    const label = (
      <CaptionText style={{ paddingHorizontal: UI_SIZES.spacing.medium, marginTop: UI_SIZES.spacing.medium }}>{title}</CaptionText>
    );
    let box: JSX.Element | null = null;

    if (isEditMode) {
      box = editable ? (
        <ContainerTextInput
          style={{
            paddingVertical: UI_SIZES.spacing.small,
          }}
          onChangeText={text => {
            if (validator) {
              if (validator.key === 'homePhoneValid') {
                if (text === '') this.setState({ [validator.key]: true });
                else this.setState({ [validator.key]: validator.regex.test(text) });
              } else {
                this.setState({ [validator.key]: validator.regex.test(text) });
              }
            }
            setter!(text);
          }}
          {...(keyboardType ? { keyboardType } : {})}
          {...(placeholder ? { placeholder } : {})}
          {...(placeholderTextColor ? { placeholderTextColor } : {})}>
          <SmallText
<<<<<<<< HEAD:src/user/containers/ProfilePage.tsx
            style={{
              lineHeight: undefined,
              textAlignVertical: 'center',
              color: validator
                ? this.state[validator.key]
                  ? theme.ui.text.regular
                  : theme.palette.status.failure.regular
                : theme.ui.text.regular,
            }}>
========
            style={[
              {
                color: validator
                  ? this.state[validator.key]
                    ? theme.ui.text.regular
                    : theme.palette.status.failure.regular
                  : theme.ui.text.regular,
              },
              styles.textOnEdit,
            ]}>
>>>>>>>> release/1.9.3:src/user/containers/user-profile/screen.tsx
            {getter()}
          </SmallText>
        </ContainerTextInput>
      ) : (
<<<<<<<< HEAD:src/user/containers/ProfilePage.tsx
        <ContainerView style={{ flex: 1, justifyContent: 'space-between' }}>
          <SmallText numberOfLines={1} style={{ flex: 1, color: theme.ui.text.light, textAlignVertical: 'center' }}>
========
        <ContainerView style={styles.containerItem}>
          <SmallText numberOfLines={1} style={styles.textItem}>
>>>>>>>> release/1.9.3:src/user/containers/user-profile/screen.tsx
            {getter()}
          </SmallText>
        </ContainerView>
      );
    } else {
      box = (
<<<<<<<< HEAD:src/user/containers/ProfilePage.tsx
        <ContainerView style={{ flex: 1, justifyContent: 'space-between' }}>
          <SmallText numberOfLines={1} style={{ flex: 1, color: theme.ui.text.light, textAlignVertical: 'center' }}>
========
        <ContainerView style={styles.containerItem}>
          <SmallText numberOfLines={1} style={styles.textItem}>
>>>>>>>> release/1.9.3:src/user/containers/user-profile/screen.tsx
            {getter()}
          </SmallText>
        </ContainerView>
      );
    }

    return (
      <View {...(isEditMode && !editable ? { style: { opacity: 0.33 } } : {})}>
        {label}
        {box}
      </View>
    );
  }
}

export class UserProfileScreen extends React.PureComponent<IProfilePageProps & NavigationInjectedProps> {
  constructor(props: IProfilePageProps) {
    super(props);
    this.props.navigation.setParams({
      onSave: this.props.onSave,
      onCancel: () => {
        this.props.dispatch(profileUpdateErrorAction({}));
      },
    });
  }

  render() {
    const { navigation, session } = this.props;
    const canEdit = session.user.type !== UserType.Student;
    const isEditMode = navigation.getParam('edit', false);
    const navBarInfo = isEditMode
      ? {
          title: I18n.t('MyProfile'),
          left: (
            <HeaderAction
              onPress={() => {
                navigation.setParams({ edit: false });
                navigation.setParams({ updatedProfileValues: undefined });
                if (navigation.getParam('onCancel')) navigation.getParam('onCancel')();
              }}
              text={I18n.t('Cancel')}
            />
          ),
          right: canEdit ? (
            <HeaderAction
              onPress={() => {
                const values = navigation.getParam('updatedProfileValues') as IProfilePageState;
                if (!isEmpty(values)) {
                  if (values.loginAliasValid && values.homePhoneValid) {
                    navigation.setParams({ edit: false });
                    if (navigation.getParam('onSave')) navigation.getParam('onSave')(navigation.getParam('updatedProfileValues'));
                  } else {
                    Alert.alert(I18n.t('common-ErrorUnknown2'), I18n.t('ProfileInvalidInformation'));
                  }
                } else {
                  navigation.setParams({ edit: false });
                }
              }}
              text={I18n.t('Save')}
            />
          ) : null,
        }
      : {
          title: I18n.t('MyProfile'),
          right: canEdit ? (
            <HeaderAction onPress={() => navigation.setParams({ edit: true })} iconName="new_post" iconSize={24} />
          ) : null,
        };
    return (
      <PageView navigation={navigation} {...(isEditMode ? { navBar: navBarInfo } : { navBarWithBack: navBarInfo })}>
        <ProfilePage {...this.props} key={this.props.userinfo.forceRefreshKey} />
      </PageView>
    );
  }
}

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

const uploadAvatarAction = (avatar: LocalFile) => async (_dispatch: Dispatch) => {
  return workspaceService.uploadFile(getUserSession(), avatar, {});
};

<<<<<<<< HEAD:src/user/containers/ProfilePage.tsx
const ProfilePageConnected = connect(
========
const UserProfileScreenConnected = connect(
>>>>>>>> release/1.9.3:src/user/containers/user-profile/screen.tsx
  (state: any) => {
    const ret = {
      userauth: state.user.auth,
      userinfo: state.user.info,
      session: getUserSession(),
    };
    return ret;
  },
  (dispatch: ThunkDispatch<any, void, AnyAction>) => ({
    onSave(updatedProfileValues: IUpdatableProfileValues) {
      dispatch(profileUpdateAction(updatedProfileValues));
    },
    dispatch,
    onPickFileError: (notifierId: string) => dispatch(pickFileError(notifierId)),
    onUploadAvatarError: () => dispatch(uploadAvatarError()),
    onUploadAvatar: (avatar: LocalFile) => dispatch(uploadAvatarAction(avatar)),
    onUpdateAvatar: (imageWorkspaceUrl: string) =>
      dispatch(profileUpdateAction({ picture: imageWorkspaceUrl }, true)) as unknown as Promise<void>,
  }),
)(UserProfileScreen);

export default withViewTracking('user/profile')(UserProfileScreenConnected);
