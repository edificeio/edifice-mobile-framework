import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { Text, TextBold } from '~/framework/components/text';
import { LeftColoredItem } from '~/modules/viescolaire/viesco/components/Item';

import { viescoTheme } from '../../viesco/utils/viescoTheme';

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
      <TextBold style={styles.matiereText}>{matiere}</TextBold>
      <Text style={styles.authorText}>{author}</Text>
    </View>
  </LeftColoredItem>
);
