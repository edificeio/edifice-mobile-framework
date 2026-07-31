import * as React from 'react';
import { Alert } from 'react-native';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import theme, { getThemes, setTheme } from '~/app/theme';
import DropdownPicker from '~/framework/components/pickers/dropdown';
import { sessionScreen } from '~/framework/components/screen';
import ScrollView from '~/framework/components/scrollView';
import { HeadingXSText, SmallText } from '~/framework/components/text';

import styles from './styles';
import type { IThemeSelectItem, UserThemeScreenPrivateProps } from './types';

export const computeNavBar = screenOptions(() => ({ title: I18n.get('user-theme-title') }));

export default sessionScreen<UserThemeScreenPrivateProps>(function UserThemeScreen() {
  const themes = getThemes();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<number>(themes.findIndex(t => t.level === theme.level));

  const values: IThemeSelectItem[] = themes.map((t, index) => ({ label: I18n.get(t.displayName), value: index }));

  const onChangeTheme = React.useCallback(
    item => {
      if (item.value === selected) return;
      Alert.alert(I18n.get('user-theme-alerttitle'), I18n.get('user-theme-alerttext'), [
        {
          text: I18n.get('common-cancel'),
        },
        {
          onPress: () => {
            setSelected(item.value);
            setTheme(item.value);
          },
          style: 'default',
          text: I18n.get('common-ok'),
        },
      ]);
    },
    [selected],
  );

  return (
    <ScrollView style={styles.page}>
      <HeadingXSText style={styles.title}>{I18n.get('user-theme-toptitle')}</HeadingXSText>
      <SmallText style={styles.text}>{I18n.get('user-theme-text')}</SmallText>
      <DropdownPicker
        open={isDropdownOpen}
        value={selected}
        items={values}
        setOpen={setIsDropdownOpen}
        setValue={() => {}}
        onSelectItem={onChangeTheme}
      />
    </ScrollView>
  );
});
