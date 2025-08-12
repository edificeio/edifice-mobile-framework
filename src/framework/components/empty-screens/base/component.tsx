import React from 'react';
import { View } from 'react-native';

import { Svg } from '../../picture';
import { HeadingSText, SmallText } from '../../text';
import styles from '../styles';
import { EmptyContentProps } from '../types';

export function EmptyContent({ svg, text, title }: Readonly<EmptyContentProps>) {
  return (
    <View style={styles.container}>
      <Svg name={svg} style={styles.illustration} />
      <View style={styles.textContainer}>
        {title !== undefined && <HeadingSText style={styles.title}>{title}</HeadingSText>}
        {text !== undefined && <SmallText style={styles.text}>{text}</SmallText>}
      </View>
    </View>
  );
}
