import * as React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyText } from '~/framework/components/text';
import { EventType, IClassCallStudent } from '~/framework/modules/viescolaire/presences/model';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

import { EventButton } from './EventButton';

const styles = StyleSheet.create({
  container: {
    rowGap: UI_SIZES.spacing.small,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
    marginBottom: UI_SIZES.spacing.small,
  },
  separatorContainer: {
    height: 1,
    marginHorizontal: UI_SIZES.spacing.minor,
    backgroundColor: theme.palette.grey.cloudy,
  },
});

type StudentStatusProps = {
  hasAbsenceReasons: boolean;
  student?: IClassCallStudent;
  style?: ViewStyle;
  createAbsence: (studentId: string) => Promise<void>;
  deleteAbsence: (eventId: number) => Promise<void>;
  dismissBottomSheet: () => void;
  openEvent: (student: IClassCallStudent, type: EventType) => void;
};

export const StudentStatus = ({
  hasAbsenceReasons,
  student,
  style,
  createAbsence,
  deleteAbsence,
  dismissBottomSheet,
  openEvent,
}: StudentStatusProps) => {
  if (!student) return null;
  const isAbsent = student.events.some(event => event.typeId === EventType.ABSENCE);
  const hasSecondaryEvent = student.events.some(event => [EventType.LATENESS, EventType.DEPARTURE].includes(event.typeId));

  const openLateness = () => openEvent(student, EventType.LATENESS);

  const openDeparture = () => openEvent(student, EventType.DEPARTURE);

  const onPressPresent = () => {
    if (isAbsent) {
      deleteAbsence(student.events.find(event => event.typeId === EventType.ABSENCE)!.id);
    }
    dismissBottomSheet();
  };

  const onPressAbsent = () => {
    if (hasAbsenceReasons) {
      openEvent(student, EventType.ABSENCE);
    } else if (isAbsent) {
      deleteAbsence(student.events.find(event => event.typeId === EventType.ABSENCE)!.id);
      dismissBottomSheet();
    } else {
      createAbsence(student.id);
      dismissBottomSheet();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.nameContainer}>
        <SingleAvatar size={48} userId={student.id} status={2} />
        <BodyText numberOfLines={1}>{student.name}</BodyText>
      </View>
      <EventButton
        backgroundColor={theme.palette.status.warning.pale}
        iconName="ui-clock-alert"
        text={I18n.get('presences-call-studentstatus-lateness')}
        isSelected={student.events.some(event => event.typeId === EventType.LATENESS)}
        onPress={openLateness}
      />
      <EventButton
        backgroundColor={theme.palette.status.warning.pale}
        iconName="ui-leave"
        text={I18n.get('presences-call-studentstatus-departure')}
        isSelected={student.events.some(event => event.typeId === EventType.DEPARTURE)}
        onPress={openDeparture}
      />
      <View style={styles.separatorContainer} />
      <EventButton
        backgroundColor={theme.palette.status.success.pale}
        iconName="ui-success_outline"
        text={I18n.get('presences-call-studentstatus-present')}
        disabled={hasSecondaryEvent}
        isSelected={!student.events.length}
        onPress={onPressPresent}
      />
      <EventButton
        backgroundColor={theme.palette.status.failure.pale}
        iconName="ui-error"
        text={I18n.get('presences-call-studentstatus-absent')}
        isSelected={isAbsent}
        onPress={onPressAbsent}
      />
    </View>
  );
};
