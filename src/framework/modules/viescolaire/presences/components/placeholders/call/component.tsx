import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';

import { UI_STYLES } from '~/framework/components/constants';
import CallCardPlaceholder from '~/framework/modules/viescolaire/presences/components/placeholders/call-card';

export default function CallPlaceholder() {
  const renderStudent = (lineWidth: number) => (
    <View style={styles.studentContainer}>
      <PlaceholderMedia size={48} isRound style={styles.studentPicture} />
      <View style={UI_STYLES.flexGrow1}>
        <PlaceholderLine width={lineWidth} style={[styles.mb0, styles.h24, styles.br4]} />
      </View>
      <PlaceholderMedia size={32} style={styles.br4} />
    </View>
  );

  return (
    <Placeholder Animation={Fade}>
      <View style={styles.cardContainer}>
        <CallCardPlaceholder />
      </View>
      <View style={styles.listContainer}>
        {renderStudent(55)}
        {renderStudent(80)}
        {renderStudent(35)}
        {renderStudent(45)}
        {renderStudent(70)}
        {renderStudent(60)}
        {renderStudent(40)}
      </View>
    </Placeholder>
  );
}
