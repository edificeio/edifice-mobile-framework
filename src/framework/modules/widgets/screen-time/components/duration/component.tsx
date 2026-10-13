import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder';

import { I18n } from '~/app/i18n';
import { HeadingXSText, SmallText } from '~/framework/components/text';
import { formatDuration, totalMinutes } from '~/framework/modules/widgets/screen-time/util/duration';

import styles from './styles';
import { ScreenTimeDurationProps } from './types';

const PLACEHOLDER_DAYS = [0, 1];

function DayDuration({ isLoadingValues, label, value }: Readonly<{ label: string; isLoadingValues?: boolean; value: string }>) {
  return (
    <View style={styles.day}>
      <SmallText>{label}</SmallText>
      {isLoadingValues ? (
        <Placeholder Animation={Fade}>
          <PlaceholderLine width={40} noMargin style={styles.placeholderValue} />
        </Placeholder>
      ) : (
        <HeadingXSText style={styles.duration} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </HeadingXSText>
      )}
    </View>
  );
}

export function ScreenTimeDuration({ isLoadingValues, today, yesterday }: Readonly<ScreenTimeDurationProps>) {
  return (
    <View style={styles.root}>
      <DayDuration
        label={I18n.get('widget-screen-time-today')}
        value={formatDuration(totalMinutes(today))}
        isLoadingValues={isLoadingValues}
      />
      <DayDuration
        label={I18n.get('widget-screen-time-yesterday')}
        value={formatDuration(totalMinutes(yesterday))}
        isLoadingValues={isLoadingValues}
      />
    </View>
  );
}

export function ScreenTimeDurationPlaceholder() {
  return (
    <View style={styles.root}>
      {PLACEHOLDER_DAYS.map(day => (
        <View key={day} style={styles.day}>
          <PlaceholderLine width={60} noMargin />
          <PlaceholderLine width={40} noMargin style={styles.placeholderDuration} />
        </View>
      ))}
    </View>
  );
}
