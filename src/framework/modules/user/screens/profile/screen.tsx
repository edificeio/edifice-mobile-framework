import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { Linking, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import appConf from '~/framework/util/appConf';
import { ImagePicked, MenuAction } from '~/framework/components/menus/actions';
import { BodyText, CaptionBoldText, HeadingXSText, SmallText } from '~/framework/components/text';
import { assertSession, getSession } from '~/framework/modules/auth/reducer';
import { profileUpdateAction } from '~/framework/modules/user/actions';
import UserCard from '~/framework/modules/user/components/user-card';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import workspaceService from '~/framework/modules/workspace/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import { LocalFile } from '~/framework/util/fileHandler';
import { Image, formatSource } from '~/framework/util/media';
import Notifier from '~/framework/util/notifier';
import { notifierShowAction } from '~/framework/util/notifier/actions';
import { isEmpty } from '~/framework/util/object';
import { Trackers } from '~/framework/util/tracker';
import { pickFileError } from '~/infra/actions/pickFile';
import { HobbieVisibility, InfoPerson } from '~/framework/modules/user/model';

import styles from './styles';
import { ProfilePageProps } from './types';
import { userService } from '~/framework/modules/user/service';
import { ContentLoader } from '~/framework/hooks/loader';
import ScrollView from '~/framework/components/scrollView';
import { TextAvatar } from '~/framework/components/textAvatar';
import { UserType } from '~/framework/modules/auth/service';
import { NamedSVG } from '~/framework/components/picture';
import { UI_SIZES } from '~/framework/components/constants';
import theme from '~/app/theme';
import { displayDate } from '~/framework/util/date';
import { ButtonLineIconGroup, LineIconButton } from '~/framework/components/buttons/lineIcon';
import BottomSheet from 'react-native-bottomsheet';
import Clipboard from '@react-native-clipboard/clipboard';
import ActionButton from '~/framework/components/buttons/action';
import { conversationRouteNames } from '~/framework/modules/conversation/navigation';

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

const renderEmoji = (category): string => {
  switch (category) {
    case 'sport':
      return '🏆';
    case 'cinema':
      return '🎬';
    case 'animals':
      return '🐼';
    case 'music':
      return '🎼';
    case 'places':
      return '🌏';
    case 'books':
      return '📚';
    default:
      return '';
  }
};

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
    <LineIconButton
      text={isEmpty(text) ? emptyText : text!}
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
  Linking.canOpenURL(`tel:${tel}`)
    .then(supported => {
      if (!supported) {
        console.log(`L'appel du numéro ${tel} n'est pas supporté.`);
      } else {
        return Linking.openURL(`tel:${tel}`);
      }
    })
    .catch(err => console.error("Une erreur s'est produite lors de l'appel du numéro.", err));
};

const UserProfileScreen = (props: ProfilePageProps) => {
  const { route, session, navigation, onUploadAvatar, onUpdateAvatar, onPickFileError, onUploadAvatarError } = props;

  const [updatingAvatar, setUpdatingAvatar] = React.useState<boolean>(false);
  const [userInfo, setUserInfo] = React.useState<undefined | InfoPerson>(undefined);
  const [family, setFamily] = React.useState<undefined | { relatedId: string | null; relatedName: string | null }[]>(undefined);
  const [isMyProfile, setIsMyProfile] = React.useState<boolean>(true);
  // const isMyProfile = React.useMemo(
  //   () => (route.params.userId && route.params.userId !== session?.user.id ? false : true),
  //   [route, session],
  // );

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
        <HeadingXSText style={family ? {} : styles.blocTitle}>
          {userInfo?.type === UserType.Student
            ? I18n.get(family?.length! > 1 ? 'user-profile-relatives' : 'user-profile-relative')
            : I18n.get(family?.length! > 1 ? 'user-profile-children' : 'user-profile-child')}
        </HeadingXSText>
        {!isEmpty(family) ? (
          family?.map(user => (
            <TouchableOpacity style={styles.userFamily}>
              <TextAvatar userId={user.relatedId!} text={user.relatedName!} isHorizontal size={36} />
              <NamedSVG
                style={styles.userFamilyIcon}
                name="ui-rafterRight"
                width={UI_SIZES.dimensions.width.mediumPlus}
                height={UI_SIZES.dimensions.height.mediumPlus}
                fill={theme.palette.grey.black}
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
        <HeadingXSText style={styles.blocTitle}>
          {I18n.get(schools.length > 1 ? 'user-profile-structures' : 'user-profile-structure')}
        </HeadingXSText>
        <ButtonLineIconGroup>
          {renderTextIcon({
            icon: 'ui-school',
            text: `${
              schools[0] +
              (schools.length > 1
                ? ' + ' +
                  (schools.length - 1) +
                  ' ' +
                  I18n.get(schools.length > 1 ? 'user-profile-structures' : 'user-profile-structure').toLowerCase()
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
                  I18n.get('user-profile-classOf') +
                  classes[0] +
                  (classes.length > 1
                    ? ' + ' +
                      (classes.length - 1) +
                      ' ' +
                      I18n.get(classes.length > 1 ? 'user-profile-classes' : 'user-profile-class')
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
        </ButtonLineIconGroup>
      </View>
    );
  };

  const renderPersonnalInfos = () => {
    if (isEmpty(userInfo?.birthdate) && isEmpty(userInfo?.email) && isEmpty(userInfo?.tel) && isEmpty(userInfo?.mobile)) return;
    return (
      <View style={styles.bloc}>
        <HeadingXSText style={styles.blocTitle}>{I18n.get('user-profile-personnalInfos')}</HeadingXSText>
        <ButtonLineIconGroup>
          {userInfo?.birthdate
            ? renderTextIcon({
                icon: 'ui-anniversary',
                text: displayDate(userInfo?.birthdate, 'short'),
              })
            : null}
          {renderTextIcon({
            icon: 'ui-mail',
            text: userInfo?.email,
            onPress: () =>
              showBottomMenu([{ title: I18n.get('user-profile-copyEmail'), action: () => Clipboard.setString(userInfo?.email!) }]),
            show: isMyProfile,
          })}
          {renderTextIcon({
            icon: 'ui-phone',
            text: userInfo?.tel ?? undefined,
            onPress: () =>
              showBottomMenu([
                { title: I18n.get('user-profile-call') + ' ' + userInfo?.tel, action: () => callPhoneNumber(userInfo?.tel) },
              ]),
            show: isMyProfile,
          })}
          {renderTextIcon({
            icon: 'ui-smartphone',
            text: userInfo?.mobile,
            onPress: () =>
              showBottomMenu([
                { title: I18n.get('user-profile-call') + ' ' + userInfo?.mobile, action: () => callPhoneNumber(userInfo?.mobile) },
              ]),
            show: isMyProfile,
          })}
        </ButtonLineIconGroup>
      </View>
    );
  };

  const renderAbout = () => {
    if (!isMyProfile && isEmpty(userInfo?.health)) return;
    return (
      <View style={styles.bloc}>
        <HeadingXSText style={styles.blocTitle}>{I18n.get('user-profile-about')}</HeadingXSText>
        {userInfo?.health ? (
          <SmallText>{userInfo?.health}</SmallText>
        ) : (
          <SmallText style={styles.textEmpty}>{I18n.get('user-profile-about-empty')}</SmallText>
        )}
      </View>
    );
  };

  const renderMoodMotto = () => {
    if ((isEmpty(userInfo?.mood) || userInfo?.mood === 'default') && isEmpty(userInfo?.motto) && !isMyProfile) return;
    const degre = appConf.is1d ? '1d' : '2d';
    return (
      <View style={styles.bloc}>
        <HeadingXSText style={styles.blocTitle}>{I18n.get('user-profile-mood-motto')}</HeadingXSText>
        <View style={styles.moodMotto}>
          <View style={styles.mood}>
            {userInfo?.mood ? (
              <>
                <Image source={renderMoodPicture[degre][userInfo?.mood ?? 'none']} style={styles.moodPicture} />
                <CaptionBoldText>{I18n.get(`user-profile-mood-${userInfo?.mood}-${degre}`)}</CaptionBoldText>
              </>
            ) : (
              //verif avec le back si renvoie 'default' automatiquement à la création
              <>
                <NamedSVG
                  name="ui-question"
                  width={UI_SIZES.dimensions.width.largePlus}
                  height={UI_SIZES.dimensions.width.largePlus}
                  fill={theme.palette.grey.graphite}
                />
                <CaptionBoldText style={styles.textEmpty}>{I18n.get('user-profile-moodEmpty')}</CaptionBoldText>
              </>
            )}
          </View>
          {isEmpty(userInfo?.motto) ? (
            <BodyText style={[styles.motto, styles.textEmpty]}>
              {I18n.get(isMyProfile ? 'user-profile-mottoEmpty' : 'user-profile-notSpecified')}
            </BodyText>
          ) : (
            <BodyText style={styles.motto}>{`"${userInfo?.motto}"`}</BodyText>
          )}
        </View>
      </View>
    );
  };

  const renderHobbies = () => {
    let emptyHobbie = '';
    const hobbiesItems = ['animals', 'books', 'cinema', 'music', 'places', 'sport'];
    hobbiesItems.forEach(hobbie => {
      const index = userInfo?.hobbies.findIndex(
        //delete profile condition to prod
        hobbieItem =>
          isMyProfile
            ? hobbieItem.category === hobbie
            : hobbieItem.category === hobbie && hobbieItem.visibility === HobbieVisibility.PUBLIC,
      );
      if (index === -1 || (index! >= 0 && userInfo?.hobbies[index!].values === '')) emptyHobbie += `${renderEmoji(hobbie)} `;
    });
    return (
      <View style={styles.bloc}>
        <HeadingXSText style={styles.blocTitle}>{I18n.get('user-profile-hobbies')}</HeadingXSText>
        <View style={styles.hobbies}>
          {userInfo?.hobbies.map(hobbie =>
            //delete myprofile & visibility condition to prod
            isMyProfile && hobbie.values ? (
              <View style={styles.hobbie}>
                <SmallText>{`${renderEmoji(hobbie.category)} ${hobbie.values}`}</SmallText>
              </View>
            ) : hobbie.values && hobbie.visibility === HobbieVisibility.PUBLIC ? (
              <View style={styles.hobbie}>
                <SmallText>{`${renderEmoji(hobbie.category)} ${hobbie.values}`}</SmallText>
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
        {renderFamily()}
        {renderStructures()}
        {renderPersonnalInfos()}
        {renderAbout()}
        {renderMoodMotto()}
        {renderHobbies()}
        <ActionButton text="Toggle profile" type="secondary" action={() => setIsMyProfile(!isMyProfile)} />
      </ScrollView>
    );
  };

  return (
    <ContentLoader
      loadContent={init}
      renderContent={renderPage}
      renderError={() => <SmallText>Error</SmallText>}
      renderLoading={() => <SmallText>Loading</SmallText>}
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
