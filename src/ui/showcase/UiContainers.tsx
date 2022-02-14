import glamorous from 'glamorous-native';
import * as React from 'react';
import { Text, View } from 'react-native';

import { Badge } from '~/ui/Badge';
import { TouchCard } from '~/ui/Card';
import { DateView } from '~/ui/DateView';

/**
 * UiContaiers
 * Ui showcase set showing all containers
 */
const MarginTouchCard = glamorous(TouchCard)({ margin: 10 });

export default () => (
  <View>
    <Text>Ui Contaiers</Text>
    <MarginTouchCard>
      <Text>Card and TouchCard (with custom margin)</Text>
    </MarginTouchCard>
    <Badge content={33} />
    <DateView date={Date.now()} />
  </View>
);
