import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { LeftColoredItem } from '~/framework/modules/viescolaire/dashboard/components/Item';

const styles = StyleSheet.create({
  authorText: {
    color: theme.palette.grey.stone,
  },
  matiereText: {
    textTransform: 'uppercase',
  },
  sessionLeftColoredItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  sessionView: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
});

export const SessionItem = ({ author, matiere }: any) => (
  <LeftColoredItem style={styles.sessionLeftColoredItem} color={viescoTheme.palette.diary}>
    <View style={styles.sessionView}>
      <SmallBoldText style={styles.matiereText}>{matiere}</SmallBoldText>
      <SmallText style={styles.authorText}>{author}</SmallText>
    </View>
  </LeftColoredItem>
);
