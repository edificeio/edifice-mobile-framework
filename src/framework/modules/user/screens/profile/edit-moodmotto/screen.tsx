import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { Alert, Image, Platform, ScrollView, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import { UI_SIZES } from '~/framework/components/constants';
import InputContainer from '~/framework/components/inputs/container';
import MultilineTextInput from '~/framework/components/inputs/multiline';
import { NavBarAction } from '~/framework/components/navigation';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import { CaptionText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import usePreventBack from '~/framework/hooks/prevent-back';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { userService } from '~/framework/modules/user/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import appConf from '~/framework/util/appConf';

import { renderMoodPicture } from '.';
import styles from './styles';
import type { UserEditMoodMottoScreenProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.editMoodMotto>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('user-profile-mood-motto'),
  }),
});

const UserEditMoodMottoScreen = (props: UserEditMoodMottoScreenProps) => {
  const { route, navigation } = props;
  const { userId, description, descriptionVisibility, hobbies } = route.params;

  const [mood, setMood] = React.useState<string>();
  const [motto, setMotto] = React.useState<string>();
  const [isSending, setIsSending] = React.useState<boolean>(false);

  const PageComponent = React.useMemo(() => {
    return Platform.select<typeof KeyboardPageView | typeof PageView>({ ios: KeyboardPageView, android: PageView })!;
  }, []);

  const scrollViewRef = React.useRef<ScrollView>(null);

  const moods = ['default', 'happy', 'proud', 'dreamy', 'love', 'tired', 'angry', 'worried', 'sick', 'joker', 'sad'];

  const widthMood = React.useMemo(() => (UI_SIZES.screen.width - 2 * UI_SIZES.spacing.medium - 3 * UI_SIZES.spacing.small) / 4, []);

  const onSaveMoodMotto = async () => {
    if (mood === route.params.mood && motto === route.params.motto) navigation.goBack();
    try {
      setIsSending(true);

      const body = JSON.stringify({ mood, motto: motto?.trim() });
      await userService.person.put(userId, body);
      navigation.navigate(userRouteNames.profile, {
        newMood: mood,
        newMotto: motto?.trim(),
        newDescriptionVisibility: descriptionVisibility,
        newDescription: description,
        newHobbies: hobbies,
      });
      Toast.showSuccess(I18n.get('user-profile-toast-editMoodMottoSuccess'));
    } catch {
      Toast.showError(I18n.get('toast-error-text'));
    } finally {
      setIsSending(false);
    }
  };

  const onFocusMottoInput = () => {
    Alert.alert(I18n.get('user-profile-editMoodMotto-alerttitle'), I18n.get('user-profile-editMoodMotto-alerttext'), [
      {
        text: I18n.get('user-profile-editMoodMotto-alertbutton'),
        onPress: () => setTimeout(() => scrollViewRef.current?.scrollToEnd(), 500),
      },
    ]);
  };

  const renderMoodItem = moodValue => {
    const degre = appConf.is1d ? '1d' : '2d';
    return (
      <TouchableOpacity
        style={[styles.mood, { width: widthMood }, moodValue === mood ? styles.moodActive : null]}
        onPress={() => setMood(moodValue)}>
        <Image source={renderMoodPicture[degre][moodValue]} style={styles.moodPicture} />
        <CaptionText>{I18n.get(`user-profile-mood-${moodValue}-${degre}`).toLowerCase()}</CaptionText>
      </TouchableOpacity>
    );
  };

  usePreventBack({
    title: I18n.get('user-profile-preventremove-title'),
    text: I18n.get('user-profile-preventremove-text'),
    showAlert: (route.params.mood !== mood || route.params.motto !== motto) && !isSending,
  });

  React.useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => <NavBarAction icon="ui-check" onPress={onSaveMoodMotto} />,
    });
  });

  React.useEffect(() => {
    setMood(route.params.mood);
    setMotto(route.params.motto);
  }, []);

  return (
    <PageComponent style={styles.page}>
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} bounces={false} style={styles.scrollview}>
        <InputContainer
          label={{ text: I18n.get('user-profile-mood') }}
          input={<View style={styles.moods}>{moods.map(mood => renderMoodItem(mood))}</View>}
        />
        <InputContainer
          label={{ text: I18n.get('user-profile-motto') }}
          style={styles.mottoInput}
          input={
            <MultilineTextInput
              placeholder={I18n.get('user-profile-mottoEmpty')}
              value={motto}
              numberOfLines={4}
              onChangeText={txt => setMotto(txt)}
              maxLength={75}
              onFocus={onFocusMottoInput}
              annotation={`${motto ? motto.length : '0'}/75`}
              annotationStyle={styles.annotationMotto}
            />
          }
        />
      </ScrollView>
    </PageComponent>
  );
};

export default UserEditMoodMottoScreen;
