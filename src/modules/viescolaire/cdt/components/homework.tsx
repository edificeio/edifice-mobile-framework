import * as React from 'react';
import { View } from 'react-native';

import { LeftColoredItem } from '~/modules/viescolaire/viesco/components/Item';
import { Text, TextBold } from '~/ui/Typography';
import { SquareCheckbox } from '~/ui/forms/Checkbox';

export const HomeworkItem = ({ title, subtitle, checked, disabled, onChange, hideCheckbox }: any) => (
  <LeftColoredItem shadow={!checked} style={{ alignItems: 'center', flexDirection: 'row' }} color="#FA9700">
    <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
      <TextBold>{title}</TextBold>
      <Text>{subtitle}</Text>
    </View>
    {hideCheckbox || <SquareCheckbox disabled={disabled} value={checked} color="#FA9700" onChange={onChange} />}
  </LeftColoredItem>
);
