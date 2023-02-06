import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { LeftColoredItem } from '~/modules/viescolaire/dashboard/components/Item';
import { SquareCheckbox } from '~/ui/forms/Checkbox';

const styles = StyleSheet.create({
  homeworkLeftColoredItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  homeworkView: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  sessionLeftColoredItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  sessionView: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  sessionMatiereText: {
    textTransform: 'uppercase',
  },
  sessionAuthorText: {
    color: theme.palette.grey.stone,
  },
});

export const HomeworkItem = ({
  onPress,
  title,
  subtitle,
  checked,
  disabled,
  onChange,
  hideCheckbox,
}: {
  onPress: () => void;
  title: string;
  subtitle: {
    id: number;
    label: string;
    rank: number;
    structure_id: string;
  };
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
  hideCheckbox: boolean;
}) => (
  <LeftColoredItem
    shadow
    onPress={onPress}
    style={styles.homeworkLeftColoredItem}
    color={theme.palette.complementary.orange.regular}>
    <View style={styles.homeworkView}>
      <SmallBoldText>{title}</SmallBoldText>
      <SmallText>{subtitle.label}</SmallText>
    </View>
    {hideCheckbox || (
      <SquareCheckbox disabled={disabled} value={checked} color={theme.palette.complementary.orange.regular} onChange={onChange} />
    )}
  </LeftColoredItem>
);

export const SessionItem = ({ onPress, matiere, author }: any) => (
  <LeftColoredItem shadow onPress={onPress} style={styles.sessionLeftColoredItem} color={viescoTheme.palette.diary}>
    <View style={styles.sessionView}>
      <SmallBoldText style={styles.sessionMatiereText}>{matiere}</SmallBoldText>
      <SmallText style={styles.sessionAuthorText}>{author}</SmallText>
    </View>
  </LeftColoredItem>
);
