import React from 'react';
import { View } from 'react-native';

import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import styles from '~/framework/components/empty-screens/styles';
import { EmptyContentProps } from '~/framework/components/empty-screens/types';
import { Svg } from '~/framework/components/picture';
import { HeadingSText, SmallText } from '~/framework/components/text';

export function EmptyContent({ button, extraStyle, svg, svgHeight, svgWidth, text, title }: Readonly<EmptyContentProps>) {
  const containerStyle = React.useMemo(() => [styles.container, extraStyle], [extraStyle]);

  return (
    <View style={containerStyle}>
      <Svg height={svgHeight ?? UI_SIZES.elements.image.medium} name={svg} width={svgWidth ?? UI_SIZES.elements.image.large} />
      <View style={styles.textContainer}>
        {title !== undefined && <HeadingSText style={styles.title}>{title}</HeadingSText>}
        {text !== undefined && <SmallText style={styles.text}>{text}</SmallText>}
      </View>
      {button !== undefined && <PrimaryButton action={button.action} iconLeft={button.icon} text={button.text} />}
    </View>
  );
}
