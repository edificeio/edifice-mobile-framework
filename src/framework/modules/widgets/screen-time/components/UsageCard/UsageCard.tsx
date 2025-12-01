import * as React from 'react';
import { View } from 'react-native';

import styles from './styles';

import { I18n } from '~/app/i18n';
import { BodyBoldText, BodyText } from '~/framework/components/text';
import { ScreenTimeDayResponse } from '~/framework/modules/widgets/screen-time/model';

interface UsageCardProps {
  data: ScreenTimeDayResponse | null;
  title: string;
  variant?: 'today' | 'yesterday';
}

export const UsageCard: React.FC<UsageCardProps> = ({ data, title, variant }) => {
  const cardStyle = variant === 'today' ? styles.usageCardToday : variant === 'yesterday' ? styles.usageCardYesterday : null;

  return (
    <View style={[styles.usageCard, cardStyle]}>
      <View style={styles.titleRow}>
        <BodyBoldText style={styles.cardTitle}>{title}</BodyBoldText>
        <BodyText style={styles.durationText}>
          {data && data.totalDurationString ? data.totalDurationString : I18n.get('widget-screen-time-zero-minutes')}
        </BodyText>
      </View>
    </View>
  );
};
