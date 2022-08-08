import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { Small, SmallBold } from '~/framework/components/text';
import { LeftColoredItem } from '~/modules/viescolaire/viesco/components/Item';
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

export const HomeworkItem = ({ title, subtitle, checked, disabled, onChange, hideCheckbox }: any) => (
  <LeftColoredItem shadow={!checked} style={styles.homeworkLeftColoredItem} color="#FA9700">
    <View style={styles.homeworkView}>
      <SmallBold>{title}</SmallBold>
      <Small>{subtitle}</Small>
    </View>
    {hideCheckbox || <SquareCheckbox disabled={disabled} value={checked} color="#FA9700" onChange={onChange} />}
  </LeftColoredItem>
);
