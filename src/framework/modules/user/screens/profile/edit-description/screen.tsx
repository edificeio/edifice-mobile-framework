import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import type { UserEditDescriptionScreenProps } from './types';
import { Alert, Platform } from 'react-native';
import { NavBarAction } from '~/framework/components/navigation';
import { userService } from '~/framework/modules/user/service';
import Toast from '~/framework/components/toast';
import { UNSTABLE_usePreventRemove } from '@react-navigation/native';
import { clearConfirmNavigationEvent, handleRemoveConfirmNavigationEvent } from '~/framework/navigation/helper';
import InputContainer from '~/framework/components/inputs/container';
import MultilineTextInput from '~/framework/components/inputs/multiline';
import { NamedSVG } from '~/framework/components/picture';
import { getScaleWidth } from '~/framework/components/constants';
import theme from '~/app/theme';
import ScrollView from '~/framework/components/scrollView';

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
  const { route, navigation } = props;

  const [description, setDescription] = React.useState<string>();
  const [isSending, setIsSending] = React.useState<boolean>(false);

  const PageComponent = React.useMemo(() => {
    return Platform.select<typeof KeyboardPageView | typeof PageView>({ ios: KeyboardPageView, android: PageView })!;
  }, []);

  const onSaveDescription = async () => {
    if (description === route.params.description) navigation.goBack();
    try {
      setIsSending(true);

      const body = JSON.stringify({ health: description });
      await userService.person.put(route.params.userId, body);
      navigation.navigate(userRouteNames.profile, { newDescription: description });
      Toast.showSuccess(I18n.get('user-profile-toast-editAboutSuccess'));
    } catch {
      Toast.showError(I18n.get('toast-error-text'));
    } finally {
      setIsSending(false);
    }
  };

  UNSTABLE_usePreventRemove(route.params.description !== description && !isSending, ({ data }) => {
    Alert.alert(I18n.get('user-profile-preventremove-title'), I18n.get('user-profile-preventremove-text'), [
      {
        text: I18n.get('common-quit'),
        style: 'destructive',
        onPress: () => {
          handleRemoveConfirmNavigationEvent(data.action, navigation);
        },
      },
      {
        text: I18n.get('common-continue'),
        style: 'default',
        onPress: () => {
          clearConfirmNavigationEvent();
        },
      },
    ]);
  });

  React.useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => <NavBarAction icon="ui-check" onPress={onSaveDescription} />,
    });
  });

  React.useEffect(() => {
    setDescription(route.params.description);
  }, []);

  return (
    <PageComponent style={styles.page}>
      <ScrollView>
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
        <NamedSVG
          name="ui-internet"
          height={getScaleWidth(20)}
          width={getScaleWidth(20)}
          fill={theme.palette.grey.black}
          style={styles.icon}
        />
      </ScrollView>
    </PageComponent>
  );
};

export default UserEditDescriptionScreen;
