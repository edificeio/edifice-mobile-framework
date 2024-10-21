import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { LeftColoredItem } from '~/framework/modules/viescolaire/dashboard/components/Item';
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
});

export const HomeworkItem = ({ checked, disabled, hideCheckbox, onChange, subtitle, title }: any) => (
  <LeftColoredItem shadow={!checked} style={styles.homeworkLeftColoredItem} color={theme.palette.complementary.orange.regular}>
    <View style={styles.homeworkView}>
      <SmallBoldText>{title}</SmallBoldText>
      <SmallText>{subtitle}</SmallText>
    </View>
    {hideCheckbox || (
      <SquareCheckbox disabled={disabled} value={checked} color={theme.palette.complementary.orange.regular} onChange={onChange} />
    )}
  </LeftColoredItem>
);
