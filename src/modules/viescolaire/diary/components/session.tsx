import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { LeftColoredItem } from '~/modules/viescolaire/dashboard/components/Item';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';

const styles = StyleSheet.create({
  sessionLeftColoredItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  sessionView: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  matiereText: {
    textTransform: 'uppercase',
  },
  authorText: {
    color: theme.palette.grey.stone,
  },
});

export const SessionItem = ({ matiere, author }: any) => (
  <LeftColoredItem style={styles.sessionLeftColoredItem} color={viescoTheme.palette.diary}>
    <View style={styles.sessionView}>
      <SmallBoldText style={styles.matiereText}>{matiere}</SmallBoldText>
      <SmallText style={styles.authorText}>{author}</SmallText>
    </View>
  </LeftColoredItem>
);
