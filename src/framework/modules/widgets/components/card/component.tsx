import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText } from '~/framework/components/text';
import { WIDGET_ACTION_ICON_SIZE } from '~/framework/modules/widgets/components/constants';

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
              width={WIDGET_ACTION_ICON_SIZE}
              height={WIDGET_ACTION_ICON_SIZE}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  );
}
