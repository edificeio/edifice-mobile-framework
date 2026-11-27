import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { BodyText } from '~/framework/components/text';
import type { LogData } from '~/modules/debug/model';
import { getSeverityColor } from '~/modules/debug/util';

import styles from './styles';

export interface DebugLogItemProps {
  item: LogData;
  onPress: (item: LogData) => void;
}

/** An entry of the app log: severity and time (when the entry has them), then the first two lines of the message. */
export const DebugLogItem = React.memo(function ({ item, onPress }: DebugLogItemProps) {
  const { message, severity, time } = item;
  const onPressItem = React.useCallback(() => onPress(item), [item, onPress]);
  return (
    <TouchableOpacity style={styles.logContainer} onPress={onPressItem}>
      {time && severity ? (
        <View style={styles.logTimeAndSeverityContainer}>
          <BodyText style={[styles.logSeverity, { color: getSeverityColor(severity) }]}>{severity}</BodyText>
          <BodyText>{time}</BodyText>
        </View>
      ) : null}
      <View style={styles.logMessageContainer}>
        <BodyText ellipsizeMode="tail" numberOfLines={2}>
          {message}
        </BodyText>
      </View>
    </TouchableOpacity>
  );
});
DebugLogItem.displayName = 'DebugLogItem';
