import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { BodyText } from '~/framework/components/text';
import { CallEventType } from '~/framework/modules/viescolaire/presences/model';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

import EventButton from './event-button';
import styles from './styles';
import type { StudentStatusProps } from './types';

export default function StudentStatus({
  hasAbsenceViewAccess,
  student,
  style,
  createAbsence,
  deleteAbsence,
  dismissBottomSheet,
  openEvent,
}: StudentStatusProps) {
  if (!student) return null;
  const isAbsent = student.events.some(event => event.typeId === CallEventType.ABSENCE);
  const hasSecondaryEvent = student.events.some(event => [CallEventType.LATENESS, CallEventType.DEPARTURE].includes(event.typeId));

  const openLateness = () => openEvent(student, CallEventType.LATENESS);

  const openDeparture = () => openEvent(student, CallEventType.DEPARTURE);

  const onPressPresent = () => {
    if (isAbsent) {
      deleteAbsence(student.events.find(event => event.typeId === CallEventType.ABSENCE)!.id);
    }
    dismissBottomSheet();
  };

  const onPressAbsent = () => {
    if (hasAbsenceViewAccess) {
      openEvent(student, CallEventType.ABSENCE);
    } else {
      if (isAbsent) {
        deleteAbsence(student.events.find(event => event.typeId === CallEventType.ABSENCE)!.id);
      } else {
        createAbsence(student.id);
      }
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
        isSelected={student.events.some(event => event.typeId === CallEventType.LATENESS)}
        onPress={openLateness}
      />
      <EventButton
        backgroundColor={theme.palette.status.warning.pale}
        iconName="ui-leave"
        text={I18n.get('presences-call-studentstatus-departure')}
        isSelected={student.events.some(event => event.typeId === CallEventType.DEPARTURE)}
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
}
