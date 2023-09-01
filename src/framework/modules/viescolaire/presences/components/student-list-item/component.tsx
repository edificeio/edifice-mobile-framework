import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { Picture } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
import { EventType } from '~/framework/modules/viescolaire/presences/model';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

import styles from './styles';
import type { StudentListItemProps } from './types';

export default class StudentListItem extends React.PureComponent<StudentListItemProps> {
  constructor(props: StudentListItemProps) {
    super(props);
    this.state = {
      absentEvent: props.student.events.find(event => event.typeId === EventType.ABSENCE),
      lateEvent: props.student.events.find(event => event.typeId === EventType.LATENESS),
      leavingEvent: props.student.events.find(event => event.typeId === EventType.DEPARTURE),
    };
  }

  public render() {
    const { isSelected, student, onPress } = this.props;
    const eventTypes = student.events.map(event => event.typeId);

    return (
      <TouchableOpacity onPress={onPress} style={[styles.container, isSelected && styles.containerSelected]}>
        <View style={styles.leftContainer}>
          <SingleAvatar size={36} userId={student.id} status={2} />
          <BodyText numberOfLines={1} style={styles.nameText}>
            {student.name}
          </BodyText>
          {student.lastCourseAbsent ? (
            <Picture
              type="NamedSvg"
              name="ui-error-past"
              width={20}
              height={20}
              fill={theme.palette.status.failure.regular}
              style={styles.lastCourseAbsentPicture}
            />
          ) : null}
        </View>
        <View style={styles.statusesContainer}>
          {!eventTypes.length ? (
            <Picture type="NamedSvg" name="ui-success_outline" width={32} height={32} fill={theme.palette.status.success.regular} />
          ) : null}
          {eventTypes.includes(EventType.ABSENCE) ? (
            <Picture type="NamedSvg" name="ui-error" width={32} height={32} fill={theme.palette.status.failure.regular} />
          ) : null}
          {eventTypes.includes(EventType.LATENESS) ? (
            <Picture type="NamedSvg" name="ui-clock-alert" width={32} height={32} fill={theme.palette.status.warning.regular} />
          ) : null}
          {eventTypes.includes(EventType.DEPARTURE) ? (
            <Picture type="NamedSvg" name="ui-leave" width={32} height={32} fill={theme.palette.status.warning.regular} />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }
}
