import * as React from 'react';
import { Platform } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';
import type { UserEditDescriptionScreenProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import InputContainer from '~/framework/components/inputs/container';
import MultilineTextInput from '~/framework/components/inputs/multiline';
import { NavBarAction } from '~/framework/components/navigation';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import Toast from '~/framework/components/toast';
import usePreventBack from '~/framework/hooks/prevent-back';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { userService } from '~/framework/modules/user/service';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.editDescription>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('user-profile-about'),
  }),
});

const UserEditDescriptionScreen = (props: UserEditDescriptionScreenProps) => {
  const { navigation, route } = props;
  const { hobbies, mood, motto, userId } = route.params;

  const [description, setDescription] = React.useState<string>();
  const [isSending, setIsSending] = React.useState<boolean>(false);
  const [visibility, setVisibility] = React.useState<boolean>(route.params.visibility ?? false);

  const PageComponent = React.useMemo(() => {
    return Platform.select<typeof KeyboardPageView | typeof PageView>({ android: PageView, ios: KeyboardPageView })!;
  }, []);

  const onChangeVisibility = () => {
    setVisibility(!visibility);
  };

  const onSaveDescription = async () => {
    if (description === route.params.description && visibility === route.params.visibility) navigation.goBack();
    const newVisibility = visibility ? 'public' : 'prive';
    try {
      setIsSending(true);

      const body = JSON.stringify({ health: description?.trim() });
      await userService.person.put(userId, body);
      await userService.person.editHealthVisibility(newVisibility);
      navigation.navigate(userRouteNames.profile, {
        newDescription: description?.trim(),
        newDescriptionVisibility: visibility,
        newHobbies: hobbies,
        newMood: mood,
        newMotto: motto,
      });
      Toast.showSuccess(I18n.get('user-profile-toast-editAboutSuccess'));
    } catch {
      Toast.showError(I18n.get('toast-error-text'));
    } finally {
      setIsSending(false);
    }
  };

  usePreventBack({
    showAlert: route.params.description !== description && !isSending,
    text: I18n.get('user-profile-preventremove-text'),
    title: I18n.get('user-profile-preventremove-title'),
  });

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => <NavBarAction icon="ui-check" onPress={onSaveDescription} />,
    });
  });

  React.useEffect(() => {
    setDescription(route.params.description);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageComponent style={styles.page}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <InputContainer
          label={{ text: 'Description' }}
          input={
            <MultilineTextInput
              placeholder={I18n.get('user-profile-about-empty')}
              numberOfLines={15}
              value={description}
              onChangeText={txt => setDescription(txt)}
            />
          }
        />
        <IconButton
          icon={visibility ? 'ui-internet' : 'ui-lock'}
          color={theme.palette.grey.black}
          action={onChangeVisibility}
          style={styles.buttonVisibility}
        />
      </ScrollView>
    </PageComponent>
  );
};

export default UserEditDescriptionScreen;
