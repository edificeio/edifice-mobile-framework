import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { Alert } from 'react-native';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import DropdownPicker from '~/framework/components/pickers/dropdown';
import { HeadingXSText, SmallText } from '~/framework/components/text';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { getItemJson } from '~/framework/util/storage';

import styles from './styles';
import type { UserLangScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.lang>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('user-lang-title'),
  }),
});

const I18N_APP_LANG = 'appLang';
const I18N_SHOW_KEYS_KEY = 'showKeys';

function UserLangScreen(props: UserLangScreenPrivateProps) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
  const [value, setValue] = React.useState<string>('fr');
  const values: { label: string; value: string }[] = [
    { label: I18n.get('user-lang-dropdownvalue-auto'), value: 'auto' },
    { label: I18n.get('user-lang-dropdownvalue-fr'), value: 'fr' },
    { label: I18n.get('user-lang-dropdownvalue-en'), value: 'en' },
    { label: I18n.get('user-lang-dropdownvalue-es'), value: 'es' },
  ];

  const setInitialValue = async () => {
    const lang = await getItemJson(I18N_APP_LANG);
    const showI18nKeys = await getItemJson(I18N_SHOW_KEYS_KEY);

    const initialLang = showI18nKeys ? 'wordingKeys' : lang ?? 'auto';
    setValue(initialLang as string);
  };

  React.useEffect(() => {
    setInitialValue();
  }, []);

  const onChangeLang = lang => {
    if (lang.value === value) return;
    Alert.alert(I18n.get('user-lang-alerttitle'), I18n.get('user-lang-alerttext'), [
      {
        text: I18n.get('common-cancel'),
      },
      {
        text: I18n.get('common-ok'),
        style: 'default',
        onPress: () => {
          if (lang.value === 'wordingKeys') return I18n.toggleShowKeys();
          return I18n.changeLanguage(lang.value);
        },
      },
    ]);
  };

  return (
    <PageView style={styles.page}>
      <HeadingXSText style={styles.title}>{I18n.get('user-lang-toptitle')}</HeadingXSText>
      <SmallText style={styles.text}>{I18n.get('user-lang-text')}</SmallText>
      <DropdownPicker
        open={isDropdownOpen}
        value={value}
        items={I18n.canShowKeys ? [...values, { label: I18n.get('user-lang-dropdownvalue-keys'), value: 'wordingKeys' }] : values}
        setOpen={setIsDropdownOpen}
        setValue={() => {}}
        onSelectItem={onChangeLang}
      />
    </PageView>
  );
}

export default UserLangScreen;
