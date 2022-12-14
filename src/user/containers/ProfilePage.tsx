import I18n from 'i18n-js';
import * as React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  KeyboardTypeOptions,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { HeaderAction } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import { CaptionText, SmallActionText, SmallText } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { formatSource } from '~/framework/util/media';
import { IUserSession, UserType, getUserSession } from '~/framework/util/session';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import Notifier from '~/infra/notifier/container';
import { ContainerTextInput, ContainerView } from '~/ui/ButtonLine';
import { PageContainer } from '~/ui/ContainerContent';
import { changePasswordResetAction } from '~/user/actions/changePassword';
import { IUpdatableProfileValues, profileUpdateAction, profileUpdateErrorAction } from '~/user/actions/profile';
import { UserCard } from '~/user/components/UserCard';
import { IUserAuthState } from '~/user/reducers/auth';
import { IUserInfoState } from '~/user/state/info';
import { ValidatorBuilder } from '~/utils/form';

export interface IProfilePageDataProps {
  userauth: IUserAuthState;
  userinfo: IUserInfoState;
  session: IUserSession;
}

export interface IProfilePageEventProps {
  onSave: (updatedProfileValues: IUpdatableProfileValues) => void;
  dispatch: Dispatch;
}

export type IProfilePageProps = IProfilePageDataProps & IProfilePageEventProps & NavigationInjectedProps;

export type IProfilePageState = IUpdatableProfileValues & {
  emailValid?: boolean;
  homePhoneValid?: boolean;
  mobileValid?: boolean;
  loginAliasValid?: boolean;
};

// tslint:disable-next-line:max-classes-per-file
export class ProfilePage extends React.PureComponent<IProfilePageProps, IProfilePageState> {
  defaultState: (force?: boolean) => IProfilePageState = force => ({
    displayName: this.props.userinfo.displayName,
    email: this.props.userinfo.email,
    homePhone: this.props.userinfo.homePhone,
    mobile: this.props.userinfo.mobile,
    emailValid: true,
    homePhoneValid: true,
    mobileValid: true,
    loginAlias: this.props.userinfo.loginAlias,
    loginAliasValid: true,
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

  public render() {
    const isEditMode = this.props.navigation.getParam('edit', false);
    return (
      <PageContainer>
        <Notifier id="profileTwo" />
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: theme.ui.background.card }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.select({ ios: 100, android: undefined })}>
          <ScrollView alwaysBounceVertical={false} overScrollMode="never">
            <SafeAreaView>
              <UserCard
                id={
                  this.props.userinfo.photo && formatSource(`${DEPRECATED_getCurrentPlatform()!.url}${this.props.userinfo.photo}`)
                }
                displayName={this.props.userinfo.displayName!}
                type={
                  this.props.userinfo.type! as
                    | 'Student'
                    | 'Relative'
                    | 'Teacher'
                    | 'Personnel'
                    | ('Student' | 'Relative' | 'Teacher' | 'Personnel')[]
                }
              />
              {this.renderItem({
                title: I18n.t('Login'),
                getter: () => (isEditMode ? this.state.loginAlias : this.state.loginAlias || this.props.userinfo.login),
                editable: true,
                setter: loginAlias => this.setState({ loginAlias }),
                validator: { key: 'loginAliasValid', regex: /^[0-9a-z\-\.]+$/ },
                placeholder: this.props.userinfo.login,
              })}
              {!this.props.userinfo.federated
                ? this.renderItem({
                    title: I18n.t('Password'),
                    getter: () => I18n.t('PasswordPlaceholder'),
                    modifyAction: () => {
                      this.props.dispatch(changePasswordResetAction());
                      this.props.navigation.navigate('ChangePassword');
                    },
                  })
                : null}
              {this.renderItem({
                title: I18n.t('Firstname'),
                getter: () => this.props.userinfo.firstName,
              })}
              {this.renderItem({
                title: I18n.t('Lastname'),
                getter: () => this.props.userinfo.lastName,
              })}
              {this.renderItem({
                title: I18n.t('DisplayName'),
                getter: () => this.state.displayName,
                editable: this.props.userinfo.type !== 'Relative',
                setter: displayName => this.setState({ displayName }),
              })}
              {this.renderItem({
                title: I18n.t('EmailAddress'),
                getter: () => this.props.userinfo.email,
                modifyAction: () => this.props.navigation.navigate('SendEmailVerificationCode', { isModifyingEmail: true }),
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
                getter: () => this.state.mobile,
                editable: true,
                setter: mobile => this.setState({ mobile }),
                keyboardType: 'phone-pad',
                validator: { key: 'mobileValid', regex: ValidatorBuilder.PHONE_REGEX },
              })}
              {this.renderItem({
                title: I18n.t('Birthdate'),
                getter: () =>
                  this.props.userinfo.birthDate!.format('L') === 'Invalid date'
                    ? I18n.t('common-InvalidDate')
                    : this.props.userinfo.birthDate!.format('L'),
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
    modifyAction,
    setter,
    keyboardType,
    validator,
    placeholder,
    placeholderTextColor,
  }: {
    title: string;
    getter: () => string | undefined;
    editable?: boolean;
    modifyAction?: () => void;
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

    /*if (editable && !setter) {
      console.debug(`rendering editable Profil page item "${title}", but no specified setter.`);
    }*/

    if (isEditMode) {
      box = editable ? (
        <ContainerTextInput
          onChangeText={text => {
            validator && this.setState({ [validator.key]: validator.regex.test(text) });
            setter!(text);
          }}
          {...(keyboardType ? { keyboardType } : {})}
          {...(placeholder ? { placeholder } : {})}
          {...(placeholderTextColor ? { placeholderTextColor } : {})}>
          <SmallText
            style={{
              lineHeight: undefined,
              textAlignVertical: 'center',
              color: validator
                ? this.state[validator.key]
                  ? theme.ui.text.regular
                  : theme.palette.status.failure
                : theme.ui.text.regular,
            }}>
            {getter()}
          </SmallText>
        </ContainerTextInput>
      ) : (
        <ContainerView style={{ flex: 1, justifyContent: 'space-between' }}>
          <SmallText numberOfLines={1} style={{ flex: 1, color: theme.ui.text.light, textAlignVertical: 'center' }}>
            {getter()}
          </SmallText>
          {modifyAction ? <SmallActionText>{I18n.t('common.modify')}</SmallActionText> : null}
        </ContainerView>
      );
    } else {
      box = (
        <ContainerView style={{ flex: 1, justifyContent: 'space-between' }}>
          <SmallText numberOfLines={1} style={{ flex: 1, color: theme.ui.text.light, textAlignVertical: 'center' }}>
            {getter()}
          </SmallText>
          {modifyAction ? (
            <TouchableOpacity onPress={() => modifyAction()}>
              <SmallActionText>{I18n.t('common.modify')}</SmallActionText>
            </TouchableOpacity>
          ) : null}
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

export class ProfilePageContainer extends React.PureComponent<IProfilePageProps & NavigationInjectedProps> {
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
                navigation.getParam('onCancel') && navigation.getParam('onCancel')();
              }}
              text={I18n.t('Cancel')}
            />
          ),
          right: canEdit ? (
            <HeaderAction
              onPress={() => {
                const values = navigation.getParam('updatedProfileValues') as IProfilePageState;
                if (values) {
                  if (values.loginAliasValid && values.emailValid && values.homePhoneValid && values.mobileValid) {
                    navigation.setParams({ edit: false });
                    navigation.getParam('onSave') && navigation.getParam('onSave')(navigation.getParam('updatedProfileValues'));
                  } else {
                    Alert.alert(I18n.t('ProfileInvalidInformation'));
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

  constructor(props: IProfilePageProps) {
    super(props);
    // Header events setup
    this.props.navigation.setParams({
      onSave: this.props.onSave,
      onCancel: () => {
        this.props.dispatch(profileUpdateErrorAction({}));
      },
    });
  }
}

const ProfilePageConnected = connect(
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
  }),
)(ProfilePageContainer);

export default withViewTracking('user/profile')(ProfilePageConnected);
