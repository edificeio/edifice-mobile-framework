import * as React from 'react';
import { View } from 'react-native';

import moment from 'moment';

import styles from './styles';

import { I18n } from '~/app/i18n';
import { BodyText, CaptionText } from '~/framework/components/text';
import { ScreenTimeDayResponse, ScreenTimeWeekResponse } from '~/framework/modules/widgets/screen-time/model';

export type ChartType = 'week' | 'day';

interface BarChartProps {
  data: ScreenTimeWeekResponse | ScreenTimeDayResponse | null;
  type: ChartType;
}

const CHART_HEIGHT = 200;

/**
 * Formats duration in minutes to a human-readable string
 */
const formatDuration = (minutes: number): string => {
  if (minutes === 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const BarChart: React.FC<BarChartProps> = ({ data, type }) => {
  // Check for empty data
  if (!data) {
    return (
      <View style={styles.container}>
        <BodyText style={styles.noDataText}>
          {I18n.get(type === 'week' ? 'widget-screen-time-no-data-week' : 'widget-screen-time-no-data-day')}
        </BodyText>
      </View>
    );
  }

  // Type-specific validation
  if (type === 'week') {
    const weekData = data as ScreenTimeWeekResponse;
    if (!weekData.dailySummaries || weekData.dailySummaries.length === 0) {
      return (
        <View style={styles.container}>
          <BodyText style={styles.noDataText}>{I18n.get('widget-screen-time-no-data-week')}</BodyText>
        </View>
      );
    }
  } else {
    const dayData = data as ScreenTimeDayResponse;
    if (!dayData.durations || dayData.durations.length === 0) {
      return (
        <View style={styles.container}>
          <BodyText style={styles.noDataText}>{I18n.get('widget-screen-time-no-data-day')}</BodyText>
        </View>
      );
    }
  }

  const renderWeekChart = () => {
    const weekData = data as ScreenTimeWeekResponse;
    const durations = weekData.dailySummaries.map(day => day.durationMinutes / 60);
    const maxDurationHours = durations.length > 0 ? Math.max(...durations) : 0;

    const getBarHeight = (durationMinutes: number): number => {
      const durationHours = durationMinutes / 60;
      if (maxDurationHours === 0) return 0;
      return (durationHours / maxDurationHours) * CHART_HEIGHT;
    };

    const getDayName = (dateString: string): string => {
      return moment(dateString).format('ddd');
    };

    return (
      <View style={styles.chartContainerVertical}>
        <View style={styles.barsContainerVertical}>
          {weekData.dailySummaries.map(day => {
            const barHeight = getBarHeight(day.durationMinutes);

            return (
              <View key={day.date} style={styles.barColumn}>
                <View style={styles.barContainerVertical}>
                  <View style={styles.barBackgroundVertical}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                        },
                      ]}
                    />
                  </View>
                </View>
                <CaptionText style={styles.dayLabel}>{getDayName(day.date)}</CaptionText>
                <CaptionText style={styles.durationLabel}>{formatDuration(day.durationMinutes)}</CaptionText>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderDayChart = () => {
    const dayData = data as ScreenTimeDayResponse;
    const durations = dayData.durations.map(item => item.durationMinutes);
    const maxDurationMinutes = durations.length > 0 ? Math.max(...durations) : 0;

    const getBarWidth = (durationMinutes: number): number => {
      if (maxDurationMinutes === 0) return 0;
      return (durationMinutes / maxDurationMinutes) * CHART_HEIGHT;
    };

    const getHourLabel = (hour: string): string => {
      return moment(hour, 'HH').format('HH:mm');
    };

    return (
      <>
        <View style={styles.titleContainer}>
          <BodyText style={styles.totalTime}>
            {I18n.get('widget-screen-time-total')}: {dayData.totalDurationString}
          </BodyText>
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.barsContainer}>
            {dayData.durations.map(hourData => {
              const barWidth = getBarWidth(hourData.durationMinutes);

              return (
                <View key={hourData.hour} style={styles.barRow}>
                  <CaptionText style={styles.hourLabel}>{getHourLabel(hourData.hour)}</CaptionText>
                  <View style={styles.barContainerHorizontal}>
                    <View style={[styles.barBackgroundHorizontal, { width: CHART_HEIGHT }]}>
                      <View
                        style={[
                          styles.barHorizontal,
                          {
                            width: barWidth,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <CaptionText style={styles.durationLabelHorizontal}>{formatDuration(hourData.durationMinutes)}</CaptionText>
                </View>
              );
            })}
          </View>
        </View>
      </>
    );
  };

  return <View style={styles.container}>{type === 'week' ? renderWeekChart() : renderDayChart()}</View>;
};
