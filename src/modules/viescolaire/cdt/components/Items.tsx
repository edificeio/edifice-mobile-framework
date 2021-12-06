import * as React from 'react';
import { View } from 'react-native';

import { TextBold, Text } from '~/framework/components/text';
import { LeftColoredItem } from '~/modules/viescolaire/viesco/components/Item';
import { SquareCheckbox } from '~/ui/forms/Checkbox';

export const HomeworkItem = ({ onPress, title, subtitle, checked, disabled, onChange, hideCheckbox }: any) => (
  <LeftColoredItem shadow onPress={onPress} style={{ alignItems: 'center', flexDirection: 'row' }} color="#FA9700">
    <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
      <TextBold>{title}</TextBold>
      <Text>{subtitle}</Text>
    </View>
    {hideCheckbox || <SquareCheckbox disabled={disabled} value={checked} color="#FA9700" onChange={onChange} />}
  </LeftColoredItem>
);

export const SessionItem = ({ onPress, matiere, author }: any) => (
  <LeftColoredItem shadow onPress={onPress} style={{ alignItems: 'center', flexDirection: 'row' }} color="#2bab6f">
    <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
      <TextBold style={{ textTransform: 'uppercase' }}>{matiere}</TextBold>
      <Text style={{ color: '#AFAFAF' }}>{author}</Text>
    </View>
  </LeftColoredItem>
);
