import * as React from 'react';
import { View } from 'react-native';

import ScrollView from '~/framework/components/scrollView';
import { SmallBoldText } from '~/framework/components/text';

import styles from './styles';
import { RichToolbarPageProps } from './types';

export const RichToolbarPage = (props: RichToolbarPageProps) => {
  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <SmallBoldText>{props.title}</SmallBoldText>
      </View>
      <ScrollView style={styles.content}>{props.content}</ScrollView>
    </View>
  );
};
