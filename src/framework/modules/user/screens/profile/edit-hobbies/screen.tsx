import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import type { UserEditHobbiesScreenProps, objectHobbies } from './types';
import TextInput from '~/framework/components/inputs/text';
import InputContainer from '~/framework/components/inputs/container';
import { HobbieVisibility } from '~/framework/modules/user/model';
import { Alert, Keyboard, Platform, View } from 'react-native';
import { NavBarAction } from '~/framework/components/navigation';
import { userService } from '~/framework/modules/user/service';
import Toast from '~/framework/components/toast';
import FlatList from '~/framework/components/list/flat-list';
import { KeyboardAvoidingFlatList } from 'react-native-keyboard-avoiding-scroll-view';
import { UNSTABLE_usePreventRemove } from '@react-navigation/native';
import { clearConfirmNavigationEvent, handleRemoveConfirmNavigationEvent } from '~/framework/navigation/helper';
import { UI_SIZES } from '~/framework/components/constants';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.editHobbies>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('user-profile-hobbies'),
  }),
});

const UserEditHobbiesScreen = (props: UserEditHobbiesScreenProps) => {
  const { route, navigation } = props;
  const [initialHobbies, setInitialHobbies] = React.useState<objectHobbies>();
  const [hobbies, setHobbies] = React.useState<objectHobbies>();
  const [isSending, setIsSending] = React.useState<boolean>(false);
  const [indexHobbie, setIndexHobbie] = React.useState<number>();

  const ListComponent = React.useMemo(() => {
    return Platform.select<React.ComponentType<any>>({
      ios: FlatList,
      android: KeyboardAvoidingFlatList,
    })!;
  }, []);
  const PageComponent = React.useMemo(() => {
    return Platform.select<typeof KeyboardPageView | typeof PageView>({ ios: KeyboardPageView, android: PageView })!;
  }, []);

  const flatListRef: { current: any } = React.useRef<typeof FlatList>(null);
  const inputRefs: any[] = [];

  const init = () => {
    const objectHobbies = route.params.hobbies.reduce((acc, obj) => {
      const { category, values, visibility } = obj;
      acc[category] = { values, visibility };
      return acc;
    }, {});
    setInitialHobbies(objectHobbies);
    setHobbies(objectHobbies);
  };

  const handleChangeText = (text, category) => {
    let newHobbies = { ...hobbies };
    newHobbies[category].values = text;
    setHobbies(newHobbies);
  };

  const handleChangeVisibility = (visibility, category) => {
    const newVisibility = visibility === HobbieVisibility.PUBLIC ? HobbieVisibility.PRIVE : HobbieVisibility.PUBLIC;
    let newHobbies = { ...hobbies };
    newHobbies[category].visibility = newVisibility;
    setHobbies(newHobbies);
  };

  const onSubmitEditingInput = index => {
    if (index === route.params.hobbies.length - 1) return;
    return inputRefs[index + 1].focus();
  };

  const onFocusInput = index => {
    setIndexHobbie(index);
    if (Platform.OS !== 'ios') {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          viewPosition: 1,
        });
      }, 100);
    }
  };

  const onSaveHobbies = async () => {
    if (initialHobbies === hobbies) navigation.goBack();
    try {
      setIsSending(true);
      const arrayHobbies = Object.keys(hobbies!).map(category => ({
        category,
        values: hobbies![category].values.trim(),
        visibility: hobbies![category].visibility,
      }));
      const body = JSON.stringify({ hobbies: arrayHobbies });
      await userService.person.put(route.params.userId, body);
      navigation.navigate(userRouteNames.profile, { newHobbies: arrayHobbies });
      Toast.showSuccess(I18n.get('user-profile-toast-editHobbiesSuccess'));
    } catch {
      Toast.showError(I18n.get('toast-error-text'));
    } finally {
      setIsSending(false);
    }
  };

  const renderInput = (item, index) => {
    return (
      <View style={styles.inputContainer}>
        <InputContainer
          label={{ text: I18n.get(`user-profile-editHobbies-${item.category}`) }}
          input={
            <TextInput
              placeholder={I18n.get(`user-profile-editHobbies-empty${item.category}`)}
              value={hobbies![item.category].values}
              toggleIconOn={hobbies![item.category].visibility === HobbieVisibility.PRIVE ? 'ui-lock' : 'ui-internet'}
              toggleIconOff={hobbies![item.category].visibility === HobbieVisibility.PRIVE ? 'ui-lock' : 'ui-internet'}
              onChangeText={txt => handleChangeText(txt, item.category)}
              onToggle={() => handleChangeVisibility(hobbies![item.category].visibility, item.category)}
              onSubmitEditing={() => onSubmitEditingInput(index)}
              onFocus={() => onFocusInput(index)}
              ref={element => (inputRefs[index] = element)}
            />
          }
        />
      </View>
    );
  };

  const renderInputs = () => {
    if (!hobbies) return;
    return (
      <ListComponent
        ref={flatListRef}
        keyboardShouldPersistTaps="handled"
        data={route.params.hobbies}
        removeClippedSubviews={false}
        renderItem={({ item, index }) => renderInput(item, index)}
        showsVerticalScrollIndicator={false}
        initialNumToRender={route.params.hobbies.length}
        keyExtractor={item => item.category}
        bounces={false}
      />
    );
  };

  UNSTABLE_usePreventRemove(initialHobbies !== hobbies && !isSending, ({ data }) => {
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
      headerRight: () => <NavBarAction icon="ui-check" onPress={onSaveHobbies} />,
    });
  });

  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      const keyboardSubscription = Keyboard.addListener('keyboardDidShow', () => {
        setTimeout(() => {
          if (indexHobbie !== undefined && indexHobbie > -1) {
            flatListRef.current?.scrollToIndex({
              index: indexHobbie,
              viewPosition: 1,
              viewOffset: -UI_SIZES.spacing.medium,
            });
          }
        }, 50);
      });
      return () => keyboardSubscription.remove();
    }
  }, [indexHobbie]);

  React.useEffect(() => {
    init();
  }, []);

  return <PageComponent style={styles.page}>{renderInputs()}</PageComponent>;
};

export default UserEditHobbiesScreen;
