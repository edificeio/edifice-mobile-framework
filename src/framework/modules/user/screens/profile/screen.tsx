import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, KeyboardAvoidingView, KeyboardTypeOptions, Platform, SafeAreaView, ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
import { ContainerTextInput, ContainerView } from '~/framework/components/buttons/line';
import { UI_SIZES } from '~/framework/components/constants';
import { ImagePicked } from '~/framework/components/menus/actions';
import { PageView } from '~/framework/components/page';
import { CaptionText, SmallText } from '~/framework/components/text';
import { assertSession, getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import UserCard from '~/framework/modules/user/components/user-card';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import workspaceService from '~/framework/modules/workspace/service';
import { NavBarAction, navBarOptions } from '~/framework/navigation/navBar';
import { LocalFile } from '~/framework/util/fileHandler';
import { formatSource } from '~/framework/util/media';
import { isEmpty } from '~/framework/util/object';
import { Trackers } from '~/framework/util/tracker';
import { pickFileError } from '~/infra/actions/pickFile';
import { notifierShowAction } from '~/infra/notifier/actions';
import Notifier from '~/infra/notifier/container';
import { PageContainer } from '~/ui/ContainerContent';
import { IUpdatableProfileValues, profileUpdateAction, profileUpdateErrorAction } from '~/user/actions/profile';
import { ValidatorBuilder } from '~/utils/form';

import styles from './styles';
import { IProfilePageProps, IProfilePageState } from './types';

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
    const session = assertSession();
    const isEditMode = this.props.route.params.edit ?? false;
    return (
      <PageContainer>
        <Notifier id="profileOne" />
        <Notifier id="profileTwo" />
        <KeyboardAvoidingView
          style={styles.profilePage}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.select({ ios: 100, android: undefined })}>
          <ScrollView alwaysBounceVertical={false} overScrollMode="never">
            <SafeAreaView>
              <UserCard
                id={userinfo.photo && formatSource(`${session?.platform.url}${userinfo.photo}`)}
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
                validator: { key: 'loginAliasValid', regex: /^[0-9a-z\-.]+$/ },
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
              {/* {this.renderItem({
                title: I18n.t('Birthdate'),
                getter: () =>
                  userinfo.birthDate!.format('L') === 'Invalid date'
                    ? I18n.t('common-InvalidDate')
                    : userinfo.birthDate!.format('L'),
              })} */}
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
    const isEditMode = this.props.route.params.edit ?? false;
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
            {getter()}
          </SmallText>
        </ContainerTextInput>
      ) : (
        <ContainerView style={styles.containerItem}>
          <SmallText numberOfLines={1} style={styles.textItem}>
            {getter()}
          </SmallText>
        </ContainerView>
      );
    } else {
      box = (
        <ContainerView style={styles.containerItem}>
          <SmallText numberOfLines={1} style={styles.textItem}>
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

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.notifPrefs>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('MyProfile'),
});

export class UserProfileScreen extends React.PureComponent<IProfilePageProps, IProfilePageState> {
  constructor(props: IProfilePageProps) {
    super(props);
    this.props.navigation.setParams({
      onSave: this.props.onSave,
      onCancel: () => {
        this.props.dispatch(profileUpdateErrorAction({}));
      },
    });
  }

  canEdit = this.props.session.user.type !== UserType.Student;

  componentDidUpdate() {
    const { navigation, route } = this.props;
    const isEditMode = route.params.edit ?? false;
    if (isEditMode) {
      navigation.setOptions({
        // eslint-disable-next-line react/no-unstable-nested-components
        headerLeft: () => (
          <NavBarAction
            title={I18n.t('Cancel')}
            onPress={() => {
              navigation.setParams({ edit: false });
              navigation.setParams({ updatedProfileValues: undefined });
              console.log(route.params.onCancel);
              if (route.params.onCancel) route.params.onCancel();
            }}
          />
        ),
        // eslint-disable-next-line react/no-unstable-nested-components
        headerRight: () => (
          <NavBarAction
            title={I18n.t('Save')}
            onPress={() => {
              const values = route.params.updatedProfileValues as IProfilePageState;
              if (!isEmpty(values)) {
                if (values.loginAliasValid && values.homePhoneValid) {
                  navigation.setParams({ edit: false });
                  if (route.params.onSave && route.params.updatedProfileValues)
                    route.params.onSave(route.params.updatedProfileValues);
                } else {
                  Alert.alert(I18n.t('common-ErrorUnknown2'), I18n.t('ProfileInvalidInformation'));
                }
              } else {
                navigation.setParams({ edit: false });
              }
            }}
          />
        ),
      });
      return;
    }
    if (this.canEdit) {
      navigation.setOptions({
        headerLeft: () => null,
        // eslint-disable-next-line react/no-unstable-nested-components
        headerRight: () => <NavBarAction onPress={() => navigation.setParams({ edit: true })} iconName="ui-edit" />,
      });
    }
  }

  render() {
    return (
      <PageView>
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
  return workspaceService.file.uploadFile(assertSession(), avatar, {});
};

const UserProfileScreenConnected = connect(
  (state: any) => {
    const ret = {
      userauth: state.auth,
      userinfo: state.auth.session.user,
      session: getSession(),
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

export default UserProfileScreenConnected;
