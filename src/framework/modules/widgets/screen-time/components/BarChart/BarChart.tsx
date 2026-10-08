import * as React from 'react';
import { View } from 'react-native';

import moment from 'moment';

import { I18n } from '~/app/i18n';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { BodyBoldText, CaptionText } from '~/framework/components/text';
import { ScreenTimeMessage } from '~/framework/modules/widgets/screen-time/components/message';
import { ScreenTimeDayResponse, ScreenTimeWeekResponse } from '~/framework/modules/widgets/screen-time/model';

import styles from './styles';

export type ChartType = 'week' | 'day';

interface BarChartProps {
  data: ScreenTimeWeekResponse | ScreenTimeDayResponse | null;
  type: ChartType;
}

const CHART_HEIGHT = 200;

const formatDuration = (minutes: number) => `${minutes}m`;

export const BarChart: React.FC<BarChartProps> = ({ data, type }) => {
  const [showAllHours, setShowAllHours] = React.useState(false);

  const noDataText = I18n.get(type === 'week' ? 'widget-screen-time-no-data-week' : 'widget-screen-time-no-data-day');

  // Check for empty data
  if (!data) {
    return <ScreenTimeMessage text={noDataText} />;
  }

  // Type-specific validation
  if (type === 'week') {
    const weekData = data as ScreenTimeWeekResponse;
    if (!weekData.dailySummaries || weekData.dailySummaries.length === 0) {
      return <ScreenTimeMessage text={noDataText} />;
    }
  } else {
    const dayData = data as ScreenTimeDayResponse;
    if (!dayData.durations || dayData.durations.length === 0) {
      return <ScreenTimeMessage text={noDataText} />;
    }
  }

  const renderWeekChart = () => {
    const weekData = data as ScreenTimeWeekResponse;
    const durations = weekData.dailySummaries.map(day => day.durationMinutes / 60);
    const maxDurationHours = durations.length > 0 ? Math.ceil(Math.max(...durations)) : 0;

    const getBarHeight = (durationMinutes: number): number => {
      const durationHours = durationMinutes / 60;
      if (maxDurationHours === 0) return 0;
      return (durationHours / maxDurationHours) * CHART_HEIGHT;
    };

    const getDayName = (dateString: string): string => {
      return moment(dateString).format('ddd');
    };

    // Generate scale values from 0 to maxDurationHours (every hour)
    const generateScaleValues = (): number[] => {
      if (maxDurationHours === 0) return [0];
      const values: number[] = [];
      for (let i = 0; i <= maxDurationHours; i++) {
        values.push(i);
      }
      return values;
    };

    const scaleValues = generateScaleValues();

    return (
      <View style={styles.chartContainerVertical}>
        {/* Scale on the left */}
        <View style={styles.scaleContainer}>
          {scaleValues.map(value => {
            const position = maxDurationHours > 0 ? (value / maxDurationHours) * CHART_HEIGHT : 0;
            // Position from bottom: 0h at bottom, maxh at top
            const bottomPosition = position;
            return (
              <View key={value} style={[styles.scaleLabel, { bottom: bottomPosition - 10 }]}>
                <CaptionText style={styles.scaleText}>{value}h</CaptionText>
              </View>
            );
          })}
        </View>
        {/* Chart bars with grid lines */}
        <View style={styles.chartWithGrid}>
          {/* Grid lines */}
          <View style={styles.gridContainer}>
            {scaleValues.map(value => {
              const position = maxDurationHours > 0 ? (value / maxDurationHours) * CHART_HEIGHT : 0;
              return <View key={`grid-${value}`} style={[styles.gridLine, { bottom: position }]} />;
            })}
          </View>
          {/* Bars */}
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
      </View>
    );
  };

  const renderDayChart = () => {
    const dayData = data as ScreenTimeDayResponse;
    const maxDurationMinutes = 60;

    const getBarWidth = (durationMinutes: number): number => {
      return (durationMinutes / maxDurationMinutes) * CHART_HEIGHT;
    };

    const getHourLabel = (hour: string): string => {
      return moment(hour, 'HH').format('HH:mm');
    };

    // Filter hours: by default show only hours with values, or all if toggle is on
    const usedHours = dayData.durations.filter(hourData => hourData.durationMinutes > 0);
    const shownHours = showAllHours ? dayData.durations : usedHours;

    const totalMinutes = usedHours.reduce((total, hourData) => total + hourData.durationMinutes, 0);

    return (
      <>
        <View style={styles.titleContainer}>
          <BodyBoldText style={styles.totalTime}>{I18n.get('widget-screen-time-total', { minutes: totalMinutes })}</BodyBoldText>
          <TertiaryButton
            iconLeft="ui-rafterLeft"
            iconRight="ui-rafterRight"
            text={showAllHours ? I18n.get('widget-screen-time-hide-all-hours') : I18n.get('widget-screen-time-show-all-hours')}
            action={() => setShowAllHours(!showAllHours)}
            style={styles.toggleButton}
            testID="screen-time-show-all-hours"
          />
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.barsContainer}>
            {shownHours.map(hourData => {
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
