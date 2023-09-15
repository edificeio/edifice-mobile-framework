import * as React from 'react';
import { View } from 'react-native';

import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import ScrollView from '~/framework/components/scrollView';

import styles from './styles';
import { RichToolbarPageProps } from './types';

export const RichToolbarPage = (props: RichToolbarPageProps) => {
  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <DefaultButton style={styles.headerTitle} text={props.title} activeOpacity={1} contentColor={theme.palette.grey.black} />
      </View>
      <ScrollView style={styles.content}>{props.content}</ScrollView>
    </View>
  );
};
