import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { Linking, Platform, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import appConf from '~/framework/util/appConf';
import { ImagePicked, MenuAction } from '~/framework/components/menus/actions';
import { BodyText, HeadingSText, SmallItalicText, SmallText } from '~/framework/components/text';
import { assertSession, getSession } from '~/framework/modules/auth/reducer';
import { profileUpdateAction } from '~/framework/modules/user/actions';
import UserCard from '~/framework/modules/user/components/user-card';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import workspaceService from '~/framework/modules/workspace/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import { LocalFile } from '~/framework/util/fileHandler';
import { Image, formatSource } from '~/framework/util/media';
import { notifierShowAction } from '~/framework/util/notifier/actions';
import { isEmpty } from '~/framework/util/object';
import { Trackers } from '~/framework/util/tracker';
import { pickFileError } from '~/infra/actions/pickFile';
import { InfoPerson } from '~/framework/modules/user/model';

import styles from './styles';
import { ProfilePageProps } from './types';
import { userService } from '~/framework/modules/user/service';
import { ContentLoader } from '~/framework/hooks/loader';
import ScrollView from '~/framework/components/scrollView';
import { TextAvatar } from '~/framework/components/textAvatar';
import { UserType } from '~/framework/modules/auth/service';
import { NamedSVG } from '~/framework/components/picture';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';
import theme from '~/app/theme';
import BottomSheet from 'react-native-bottomsheet';
import Clipboard from '@react-native-clipboard/clipboard';
import { conversationRouteNames } from '~/framework/modules/conversation/navigation';
import InlineButton from '~/framework/components/buttons/inline';
import { hobbiesItems, renderEmoji } from '.';
import { ButtonLineGroup, LineButton } from '~/framework/components/buttons/line';
import UserPlaceholderProfile from '~/framework/modules/user/components/placeholder/profile';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.notifPrefs>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('user-profile-appname'),
  }),
});

const renderTextIcon = ({
  icon,
  text,
  textEmpty,
  onPress,
  show,
  showArrow,
}: {
  icon: string;
  text: string | undefined;
  textEmpty?: string;
  onPress?: () => any;
  show?: boolean;
  showArrow?: boolean;
}) => {
  if (isEmpty(text) && !show) return;
  const emptyText = textEmpty ?? I18n.get('user-profile-notSpecified');
  return (
    <LineButton
      title={isEmpty(text) ? emptyText : text!}
      icon={icon}
      {...(onPress && !isEmpty(text) ? { onPress: onPress } : null)}
      {...(isEmpty(text) ? { textStyle: styles.textEmpty } : null)}
      showArrow={showArrow}
    />
  );
};

const showBottomMenu = (actions: MenuAction[]) => {
  actions.push({ title: I18n.get('common-cancel'), action: () => {} });
  BottomSheet.showBottomSheetWithOptions(
    {
      options: [
        ...actions.map(action => {
          return action.title;
        }),
      ],
      cancelButtonIndex: actions.length - 1,
    },
    index => {
      actions[index].action();
    },
  );
};

const callPhoneNumber = tel => {
  const telWithoutSpaces = tel.replace(/\s/g, '');
  Linking.canOpenURL(`tel:${telWithoutSpaces}`)
    .then(supported => {
      if (!supported) {
        console.log(`L'appel du numéro ${telWithoutSpaces} n'est pas supporté.`);
      } else {
        return Linking.openURL(`tel:${telWithoutSpaces}`);
      }
    })
    .catch(err => console.error("Une erreur s'est produite lors de l'appel du numéro.", err));
};

const UserProfileScreen = (props: ProfilePageProps) => {
  const { route, session, navigation, onUploadAvatar, onUpdateAvatar, onPickFileError, onUploadAvatarError } = props;

  const [updatingAvatar, setUpdatingAvatar] = React.useState<boolean>(false);
  const [userInfo, setUserInfo] = React.useState<undefined | InfoPerson>(undefined);
  const [family, setFamily] = React.useState<undefined | { relatedId: string | null; relatedName: string | null }[]>(undefined);
  const isMyProfile = React.useMemo(
    () => (route.params.userId && route.params.userId !== session?.user.id ? false : true),
    [route, session],
  );

  const renderMoodPicture = {
    ['1d']: {
      ['angry']: require('ASSETS/images/moods/1d/angry.png'),
      ['dreamy']: require('ASSETS/images/moods/1d/dreamy.png'),
      ['happy']: require('ASSETS/images/moods/1d/happy.png'),
      ['joker']: require('ASSETS/images/moods/1d/joker.png'),
      ['love']: require('ASSETS/images/moods/1d/love.png'),
      ['default']: require('ASSETS/images/moods/1d/none.png'),
      ['proud']: require('ASSETS/images/moods/1d/proud.png'),
      ['sad']: require('ASSETS/images/moods/1d/sad.png'),
      ['sick']: require('ASSETS/images/moods/1d/sick.png'),
      ['tired']: require('ASSETS/images/moods/1d/tired.png'),
      ['worried']: require('ASSETS/images/moods/1d/worried.png'),
    },
    ['2d']: {
      ['angry']: require('ASSETS/images/moods/2d/angry.png'),
      ['dreamy']: require('ASSETS/images/moods/2d/dreamy.png'),
      ['happy']: require('ASSETS/images/moods/2d/happy.png'),
      ['joker']: require('ASSETS/images/moods/2d/joker.png'),
      ['love']: require('ASSETS/images/moods/2d/love.png'),
      ['default']: require('ASSETS/images/moods/2d/none.png'),
      ['proud']: require('ASSETS/images/moods/2d/proud.png'),
      ['sad']: require('ASSETS/images/moods/2d/sad.png'),
      ['sick']: require('ASSETS/images/moods/2d/sick.png'),
      ['tired']: require('ASSETS/images/moods/2d/tired.png'),
      ['worried']: require('ASSETS/images/moods/2d/worried.png'),
    },
  };

  const onChangeAvatar = async (image: ImagePicked) => {
    try {
      const lc = new LocalFile(
        {
          filename: image.fileName as string,
          filepath: image.uri as string,
          filetype: image.type as string,
        },
        { _needIOSReleaseSecureAccess: false },
      );
      setUpdatingAvatar(true);
      const sc = await onUploadAvatar(lc);
      await onUpdateAvatar(sc.url);
    } catch (err: any) {
      if (err.message === 'Error picking image') {
        onPickFileError('profileOne');
      } else if (!(err instanceof Error)) {
        onUploadAvatarError();
      }
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const onDeleteAvatar = async () => {
    try {
      setUpdatingAvatar(true);
      await onUpdateAvatar('');
    } catch {
      onUploadAvatarError();
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const init = async () => {
    const data = isMyProfile ? await userService.person.get() : await userService.person.get(route.params.userId);

    if (!isEmpty(data[0].relatedId)) {
      const filteredDataFamily = data.map(({ relatedId, relatedName }) => ({ relatedName, relatedId }));
      setFamily(filteredDataFamily);
    }

    setUserInfo(data[0]);
  };

  const onNewMessage = () => {
    const user = [{ displayName: userInfo?.displayName, id: userInfo?.id }];
    if (userInfo?.type === UserType.Student && !isEmpty(family)) {
      let familyUser: any = [];
      family?.forEach(item => familyUser.push({ displayName: item.relatedName, id: item.relatedId }));
      showBottomMenu([
        {
          title: I18n.get('user-profile-sendMessage-student'),
          action: () =>
            navigation.navigate(conversationRouteNames.newMail, {
              toUsers: user,
            }),
        },
        {
          title: I18n.get('user-profile-sendMessage-relatives'),
          action: () =>
            navigation.navigate(conversationRouteNames.newMail, {
              toUsers: familyUser,
            }),
        },
        {
          title: I18n.get('user-profile-sendMessage-relatives&student'),
          action: () =>
            navigation.navigate(conversationRouteNames.newMail, {
              toUsers: user.concat(familyUser),
            }),
        },
      ]);
      return;
    }
    return navigation.navigate(conversationRouteNames.newMail, {
      toUsers: user,
    });
  };

  const renderFamily = () => {
    if (userInfo?.type !== UserType.Relative && userInfo?.type !== UserType.Student) return;
    return (
      <View style={styles.bloc}>
        <HeadingSText style={family ? {} : styles.blocTitle}>
          {userInfo?.type === UserType.Student
            ? I18n.get(family?.length! > 1 ? 'user-profile-relatives' : 'user-profile-relative')
            : I18n.get(family?.length! > 1 ? 'user-profile-children' : 'user-profile-child')}
        </HeadingSText>
        {!isEmpty(family) ? (
          family?.map(user => (
            <TouchableOpacity
              style={styles.userFamily}
              onPress={() => navigation.push(userRouteNames.profile, { userId: user.relatedId! })}>
              <TextAvatar userId={user.relatedId!} text={user.relatedName!} isHorizontal size={getScaleWidth(48)} />
              <NamedSVG
                style={styles.userFamilyIcon}
                name="ui-rafterRight"
                width={UI_SIZES.dimensions.width.mediumPlus}
                height={UI_SIZES.dimensions.height.mediumPlus}
                fill={theme.palette.primary.regular}
              />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyFamily}>
            <NamedSVG
              name="ui-question"
              width={UI_SIZES.dimensions.width.largePlus}
              height={UI_SIZES.dimensions.width.largePlus}
              fill={theme.palette.grey.graphite}
              style={styles.emptyFamilyIcon}
            />
            <BodyText style={styles.textEmpty}>{I18n.get('user-profile-notSpecified')}</BodyText>
          </View>
        )}
      </View>
    );
  };

  const renderStructures = () => {
    let schools: string[] = [];
    let classes: any[] = [];
    userInfo?.schools.forEach(school => {
      schools.push(school.name);
      classes = classes.concat(school.classes);
    });
    return (
      <View style={styles.bloc}>
        <HeadingSText style={styles.blocTitle}>
          {I18n.get(schools.length > 1 ? 'user-profile-structures' : 'user-profile-structure')}
        </HeadingSText>
        <ButtonLineGroup>
          {renderTextIcon({
            icon: 'ui-school',
            text: `${
              schools[0] +
              (schools.length > 1
                ? ' + ' +
                  (schools.length - 1) +
                  ' ' +
                  I18n.get(schools.length > 2 ? 'user-profile-structures' : 'user-profile-structure').toLowerCase()
                : '')
            }`,
            onPress:
              schools.length > 1
                ? () => navigation.navigate(userRouteNames.structures, { structures: userInfo?.schools })
                : undefined,
            showArrow: true,
          })}
          {renderTextIcon({
            icon: 'ui-class',
            text: !isEmpty(classes)
              ? `${
                  classes[0] +
                  (classes.length > 1
                    ? ' + ' +
                      (classes.length - 1) +
                      ' ' +
                      I18n.get(classes.length > 2 ? 'user-profile-classes' : 'user-profile-class')
                    : '')
                }`
              : '',
            textEmpty: I18n.get('user-profile-classEmpty'),
            show: true,
            onPress:
              classes.length > 1
                ? () => navigation.navigate(userRouteNames.structures, { structures: userInfo?.schools })
                : undefined,
            showArrow: true,
          })}
        </ButtonLineGroup>
      </View>
    );
  };

  const renderPersonnalInfos = () => {
    if (
      isEmpty(userInfo?.birthdate) &&
      isEmpty(userInfo?.email) &&
      isEmpty(userInfo?.tel) &&
      isEmpty(userInfo?.mobile) &&
      !isMyProfile
    )
      return;
    return (
      <View style={styles.bloc}>
        <HeadingSText style={styles.blocTitle}>{I18n.get('user-profile-personnalInfos')}</HeadingSText>
        <ButtonLineGroup>
          {userInfo?.birthdate
            ? renderTextIcon({
                icon: 'ui-anniversary',
                text: userInfo?.birthdate.format('D MMMM Y'),
              })
            : null}
          {renderTextIcon({
            icon: 'ui-mail',
            text: userInfo?.email,
            onPress: () =>
              showBottomMenu([{ title: I18n.get('user-profile-copyEmail'), action: () => Clipboard.setString(userInfo?.email!) }]),
            show: isMyProfile,
            showArrow: false,
          })}
          {renderTextIcon({
            icon: 'ui-phone',
            text: userInfo?.tel ?? undefined,
            onPress: () =>
              Platform.OS === 'ios'
                ? callPhoneNumber(userInfo?.tel)
                : showBottomMenu([
                    { title: I18n.get('user-profile-call') + ' ' + userInfo?.tel, action: () => callPhoneNumber(userInfo?.tel) },
                  ]),
            show: isMyProfile,
            showArrow: false,
          })}
          {renderTextIcon({
            icon: 'ui-smartphone',
            text: userInfo?.mobile,
            onPress: () =>
              Platform.OS === 'ios'
                ? callPhoneNumber(userInfo?.mobile)
                : showBottomMenu([
                    {
                      title: I18n.get('user-profile-call') + ' ' + userInfo?.mobile,
                      action: () => callPhoneNumber(userInfo?.mobile),
                    },
                  ]),
            show: isMyProfile,
            showArrow: false,
          })}
        </ButtonLineGroup>
      </View>
    );
  };

  const renderAbout = () => {
    const description = route.params.newDescription ?? userInfo?.health;
    if (!isMyProfile && isEmpty(userInfo?.health)) return;
    return (
      <View style={styles.bloc}>
        <View style={styles.blocTitle}>
          <HeadingSText>{I18n.get('user-profile-about')}</HeadingSText>
          {isMyProfile ? (
            <InlineButton
              text={I18n.get('common-edit')}
              action={() => navigation.navigate(userRouteNames.editDescription, { userId: userInfo?.id, description: description })}
            />
          ) : null}
        </View>
        {description ? (
          <SmallText>{description}</SmallText>
        ) : (
          <SmallText style={styles.textEmpty}>{I18n.get('user-profile-about-empty')}</SmallText>
        )}
      </View>
    );
  };

  const renderMoodMotto = () => {
    const mood = route.params.newMood ?? userInfo?.mood;
    const motto = route.params.newMotto ?? userInfo?.motto;
    if ((isEmpty(userInfo?.mood) || userInfo?.mood === 'default') && isEmpty(userInfo?.motto) && !isMyProfile) return;
    const degre = appConf.is1d ? '1d' : '2d';
    return (
      <View style={styles.bloc}>
        <View style={styles.blocTitle}>
          <HeadingSText>{I18n.get('user-profile-mood-motto')}</HeadingSText>
          {isMyProfile ? (
            <InlineButton
              text={I18n.get('common-edit')}
              action={() => navigation.navigate(userRouteNames.editMoodMotto, { userId: userInfo?.id, mood, motto })}
            />
          ) : null}
        </View>
        <View style={styles.moodMotto}>
          <View style={styles.mood}>
            <Image source={renderMoodPicture[degre][mood ?? 'none']} style={styles.moodPicture} />
            <SmallText>{I18n.get(`user-profile-mood-${mood ?? 'none'}-${degre}`)}</SmallText>
          </View>
          {isEmpty(motto) ? (
            <SmallItalicText style={[styles.motto, styles.textEmpty]}>
              {I18n.get(isMyProfile ? 'user-profile-mottoEmpty' : 'user-profile-notSpecified')}
            </SmallItalicText>
          ) : (
            <SmallItalicText style={styles.motto}>{`"${motto}"`}</SmallItalicText>
          )}
        </View>
      </View>
    );
  };

  const renderHobbies = () => {
    let emptyHobbie = '';
    const hobbies = route.params.newHobbies ?? userInfo?.hobbies;
    hobbiesItems.forEach(hobbie => {
      const index = hobbies?.findIndex(hobbieItem => hobbieItem.category === hobbie);
      if (index === -1 || (index! >= 0 && hobbies![index!].values === '')) emptyHobbie += `${renderEmoji[hobbie]} `;
    });
    return (
      <View style={styles.bloc}>
        <View style={styles.blocTitle}>
          <HeadingSText>{I18n.get('user-profile-hobbies')}</HeadingSText>
          {isMyProfile ? (
            <InlineButton
              text={I18n.get('common-edit')}
              action={() => navigation.navigate(userRouteNames.editHobbies, { userId: userInfo?.id, hobbies })}
            />
          ) : null}
        </View>

        <View style={styles.hobbies}>
          {hobbies!.map(hobbie =>
            hobbie.values ? (
              <View style={styles.hobbie}>
                <SmallText>{`${renderEmoji[hobbie.category]} `}</SmallText>
                <SmallText style={styles.hobbieValue}>{`${hobbie.values}`}</SmallText>
              </View>
            ) : null,
          )}
          {!isEmpty(emptyHobbie) ? (
            <View style={styles.hobbie}>
              <SmallText style={styles.textEmpty}>
                {`${
                  emptyHobbie +
                  I18n.get(emptyHobbie.length > 3 ? 'user-profile-notSpecified-multiple' : 'user-profile-notSpecified') // check length > 2 bc are emoji (2) + 1 space
                }`}
              </SmallText>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const renderPage = () => {
    return (
      <ScrollView style={styles.page}>
        {/* <Notifier id="profileOne" />
        <Notifier id="profileTwo" /> */}
        <UserCard
          id={userInfo?.photo && formatSource(`${session?.platform.url}${userInfo?.photo}`)}
          displayName={userInfo?.displayName}
          type={userInfo?.type}
          hasAvatar={!!session?.user.photo}
          updatingAvatar={updatingAvatar}
          onChangeAvatar={onChangeAvatar.bind(this)}
          onDeleteAvatar={onDeleteAvatar.bind(this)}
          canEdit={isMyProfile}
          onPressInlineButton={() => onNewMessage()}
        />
        {appConf.is1d ? renderMoodMotto() : null}
        {renderFamily()}
        {renderStructures()}
        {renderPersonnalInfos()}
        {renderAbout()}
        {appConf.is2d ? renderMoodMotto() : null}
        {renderHobbies()}
      </ScrollView>
    );
  };

  return (
    <ContentLoader
      loadContent={init}
      renderContent={renderPage}
      renderError={() => <SmallText>Error</SmallText>}
      renderLoading={() => <UserPlaceholderProfile />}
    />
  );
};

const uploadAvatarError = () => {
  return dispatch => {
    dispatch(
      notifierShowAction({
        id: 'profileOne',
        text: I18n.get('user-profile-changeavatar-error-upload'),
        icon: 'close',
        type: 'error',
      }),
    );
    Trackers.trackEvent('Profile', 'UPDATE ERROR', 'AvatarChangeError');
  };
};

const uploadAvatarAction = (avatar: LocalFile) => async (_dispatch: ThunkDispatch<any, any, any>) => {
  try {
    return await workspaceService.file.uploadFile(assertSession(), avatar, {});
  } catch {
    _dispatch(uploadAvatarError());
  }
};

const UserProfileScreenConnected = connect(
  (state: any) => {
    const ret = {
      session: getSession(),
    };
    return ret;
  },
  (dispatch: ThunkDispatch<any, void, AnyAction>) => ({
    onPickFileError: (notifierId: string) => dispatch(pickFileError(notifierId)),
    onUploadAvatarError: () => dispatch(uploadAvatarError()),
    onUploadAvatar: (avatar: LocalFile) => dispatch(uploadAvatarAction(avatar)),
    onUpdateAvatar: (imageWorkspaceUrl: string) =>
      dispatch(profileUpdateAction({ photo: imageWorkspaceUrl })) as unknown as Promise<void>,
  }),
)(UserProfileScreen);

export default UserProfileScreenConnected;
