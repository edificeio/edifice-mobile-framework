import * as React from 'react';
import { View } from 'react-native';
import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import CallCardPlaceholder from '~/framework/modules/viescolaire/presences/components/placeholders/call-card';

import styles from './styles';
import type { CallListPlaceholderProps } from './types';

export default function CallListPlaceholder(props: CallListPlaceholderProps) {
  return (
    <Placeholder Animation={Fade}>
      {props.showDayPicker ? (
        <View style={styles.dayPickerContainer}>
          <View style={styles.rowContainer}>
            <PlaceholderMedia style={[styles.w22, styles.h22, styles.br4]} />
            <PlaceholderLine width={50} style={[styles.mb0, styles.h22, styles.br4]} />
            <PlaceholderMedia style={[styles.w22, styles.h22, styles.br4]} />
          </View>
          <View style={styles.rowContainer}>
            <PlaceholderMedia style={[styles.w36, styles.h38, styles.br8]} />
            <PlaceholderMedia style={[styles.w36, styles.h38, styles.br8]} />
            <PlaceholderMedia style={[styles.w36, styles.h38, styles.br8]} />
            <PlaceholderMedia style={[styles.w36, styles.h38, styles.br8]} />
            <PlaceholderMedia style={[styles.w36, styles.h38, styles.br8]} />
            <PlaceholderMedia style={[styles.w36, styles.h38, styles.br8]} />
          </View>
        </View>
      ) : null}
      <View style={styles.listContainer}>
        <CallCardPlaceholder />
        <CallCardPlaceholder />
        <CallCardPlaceholder />
        <CallCardPlaceholder />
      </View>
    </Placeholder>
  );
}
