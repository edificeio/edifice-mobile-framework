import React from 'react';
import { View } from 'react-native';

import styles from '~/framework/components/empty-screens/styles';
import { EmptyContentProps } from '~/framework/components/empty-screens/types';
import { Svg } from '~/framework/components/picture';
import { HeadingSText, SmallText } from '~/framework/components/text';

export function EmptyContent({ extraStyle, svg, text, title }: Readonly<EmptyContentProps>) {
  const containerStyle = React.useMemo(() => [styles.container, extraStyle], [extraStyle]);

  return (
    <View style={containerStyle}>
      <Svg name={svg} style={styles.illustration} />
      <View style={styles.textContainer}>
        {title !== undefined && <HeadingSText style={styles.title}>{title}</HeadingSText>}
        {text !== undefined && <SmallText style={styles.text}>{text}</SmallText>}
      </View>
    </View>
  );
}
