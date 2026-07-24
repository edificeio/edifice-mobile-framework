import * as React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import theme, { getCurrentThemeIndex, getThemes, setTheme } from '~/app/theme';
import { Svg } from '~/framework/components/picture';
import { sessionScreen } from '~/framework/components/screen';
import ScrollView from '~/framework/components/scrollView';
import { HeadingXSText, HeadingXXSText, SmallText } from '~/framework/components/text';

import styles from './styles';
import type { UserThemeScreenPrivateProps } from './types';

export const computeNavBar = screenOptions(() => ({ title: I18n.get('user-theme-title') }));

export default sessionScreen<UserThemeScreenPrivateProps>(function UserThemeScreen() {
  const themes = getThemes();
  const [selectedIndex, setSelectedIndex] = React.useState<number>(getCurrentThemeIndex());

  const onSelect = React.useCallback(
    (index: number) => {
      if (index === selectedIndex) return;
      Alert.alert(I18n.get('user-theme-alerttitle'), I18n.get('user-theme-alerttext'), [
        { text: I18n.get('common-cancel') },
        {
          onPress: () => {
            setSelectedIndex(index);
            setTheme(index);
          },
          style: 'default',
          text: I18n.get('common-ok'),
        },
      ]);
    },
    [selectedIndex],
  );

  return (
    <ScrollView style={styles.page}>
      <HeadingXSText style={styles.title}>{I18n.get('user-theme-toptitle')}</HeadingXSText>
      <SmallText style={styles.text}>{I18n.get('user-theme-text')}</SmallText>
      <View style={styles.row}>
        {themes.map((t, index) => {
          const selected = index === selectedIndex;
          return (
            <TouchableOpacity
              key={t.level}
              activeOpacity={0.8}
              onPress={() => onSelect(index)}
              style={[styles.card, selected ? styles.cardSelected : null]}
              testID={`account-theme-${t.level}`}>
              <View style={styles.check}>
                {selected ? <Svg name="ui-check" width={20} height={20} fill={theme.palette.status.success.regular} /> : null}
              </View>
              <View style={[styles.preview, { backgroundColor: t.palette.grey.fog }]}>
                <View style={[styles.previewTop, { backgroundColor: t.palette.primary.regular }]} />
                <View style={[styles.previewBottom, { backgroundColor: t.palette.primary.light }]} />
              </View>
              <HeadingXXSText>{t.displayName}</HeadingXXSText>
              <SmallText>{t.level}</SmallText>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
});
