import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText } from '~/framework/components/text';

import styles from './styles';
import { WidgetCardProps } from './types';

export function WidgetCard({ children, expandIcon = 'ui-fullScreen', expandTestID, onExpand, title }: WidgetCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <BodyBoldText style={styles.title} numberOfLines={1}>
          {title}
        </BodyBoldText>
        {onExpand ? (
          <TouchableOpacity onPress={onExpand} testID={expandTestID}>
            <Svg
              name={expandIcon}
              fill={theme.palette.secondary.dark}
              width={UI_SIZES.elements.icon.small}
              height={UI_SIZES.elements.icon.small}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  );
}
