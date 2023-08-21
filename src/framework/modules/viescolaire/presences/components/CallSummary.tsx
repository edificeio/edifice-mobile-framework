import React from 'react';
import { StyleSheet, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { BodyText, BodyBoldText, HeadingSText } from '~/framework/components/text';
import { EventType, IClassCall } from '~/framework/modules/viescolaire/presences/model';

const styles = StyleSheet.create({
  container: {
    rowGap: UI_SIZES.spacing.medium,
  },
  eventTypeText: {
    marginLeft: UI_SIZES.spacing.minor,
    marginRight: UI_SIZES.spacing.tiny,
  },
  lightText: {
    color: theme.ui.text.light,
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryEventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.tiny,
  },
  secondaryEventText: {
    color: theme.palette.status.warning.regular,
  },
  eventTypeGap: {
    columnGap: UI_SIZES.spacing.medium,
  },
});

interface CallSummaryProps {
  call: IClassCall;
}

const countEventType = (call: IClassCall, eventType: EventType): number =>
  call.students.reduce((acc, item) => {
    return acc + (item.events.some(event => event.typeId === eventType) ? 1 : 0);
  }, 0);

export const CallSummary = (props: CallSummaryProps) => {
  const studentCount = props.call.students.length;
  const absentCount = countEventType(props.call, EventType.ABSENCE);
  const latenessCount = countEventType(props.call, EventType.LATENESS);
  const departureCount = countEventType(props.call, EventType.DEPARTURE);

  return (
    <View style={styles.container}>
      <HeadingSText>{I18n.get('presences-call-summary-heading')}</HeadingSText>
      <View style={[styles.rowContainer, styles.eventTypeGap]}>
        <View style={styles.rowContainer}>
          <Picture type="NamedSvg" name="presences" width={22} height={22} fill={theme.palette.status.success.regular} />
          <BodyText style={styles.eventTypeText}>{I18n.get('presences-call-summary-present')}</BodyText>
          <BodyBoldText>{`${studentCount - absentCount}/${studentCount}`}</BodyBoldText>
        </View>
        <View style={[styles.rowContainer, styles.eventTypeGap]}>
          <View style={styles.secondaryEventContainer}>
            <Picture
              type="NamedSvg"
              name="ui-clock-alert"
              width={22}
              height={22}
              fill={latenessCount ? theme.palette.status.warning.regular : theme.palette.grey.graphite}
            />
            <BodyBoldText style={latenessCount ? styles.secondaryEventText : styles.lightText}>{latenessCount}</BodyBoldText>
          </View>
          <View style={styles.secondaryEventContainer}>
            <Picture
              type="NamedSvg"
              name="ui-leave"
              width={22}
              height={22}
              fill={departureCount ? theme.palette.status.warning.regular : theme.palette.grey.graphite}
            />
            <BodyBoldText style={departureCount ? styles.secondaryEventText : styles.lightText}>{departureCount}</BodyBoldText>
          </View>
        </View>
      </View>
      <View style={styles.rowContainer}>
        <Picture
          type="NamedSvg"
          name="ui-error"
          width={22}
          height={22}
          fill={absentCount ? theme.palette.status.failure.regular : theme.palette.grey.graphite}
        />
        <BodyText style={[styles.eventTypeText, !absentCount && styles.lightText]}>
          {I18n.get('presences-call-summary-absent')}
        </BodyText>
        <BodyBoldText style={!absentCount && styles.lightText}>{`${absentCount}/${studentCount}`}</BodyBoldText>
      </View>
    </View>
  );
};
