import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment, { Moment } from 'moment';
import * as React from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import PrimaryButton from '~/framework/components/buttons/primary';
import DateTimePicker from '~/framework/components/dateTimePicker';
import TextInput from '~/framework/components/inputs/text';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import DropdownPicker from '~/framework/components/pickers/dropdown';
import { Picture } from '~/framework/components/picture';
import { BodyText, SmallBoldText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import usePreventBack from '~/framework/hooks/usePreventBack';
import { getSession } from '~/framework/modules/auth/reducer';
import { CallCard } from '~/framework/modules/viescolaire/presences/components/CallCard';
import { EventType, ICourse, IEvent } from '~/framework/modules/viescolaire/presences/model';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { presencesService } from '~/framework/modules/viescolaire/presences/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import { addTime, subtractTime } from '~/framework/util/date';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

import styles from './styles';
import type { PresencesDeclareEventScreenPrivateProps } from './types';

const getNavBarTitle = (eventType: EventType): string => {
  switch (eventType) {
    case EventType.ABSENCE:
      return I18n.get('presences-declareevent-absence');
    case EventType.LATENESS:
      return I18n.get('presences-declareevent-lateness');
    case EventType.DEPARTURE:
      return I18n.get('presences-declareevent-departure');
  }
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.declareEvent>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: getNavBarTitle(route.params.type),
  }),
});

const getInitialDate = (course: ICourse, eventType: EventType, event?: IEvent): Moment => {
  const now = moment();

  if (event) return eventType === EventType.LATENESS ? event.endDate : event.startDate;
  if (now.isSameOrAfter(course.startDate) && now.isSameOrBefore(course.endDate)) return now;
  return eventType === EventType.LATENESS ? addTime(course.startDate, 5, 'm') : subtractTime(course.endDate, 5, 'm');
};

const PresencesDeclareEventScreen = (props: PresencesDeclareEventScreenPrivateProps) => {
  const [isEventAlreadyExisting] = React.useState<boolean>(props.route.params.event !== undefined);
  const [date, setDate] = React.useState<Moment>(
    getInitialDate(props.route.params.course, props.route.params.type, props.route.params.event),
  );
  const [isDropdownOpen, setDropdownOpen] = React.useState<boolean>(false);
  const [reasonId, setReasonId] = React.useState<number | null>(
    props.route.params.event?.reasonId ?? props.route.params.reasons.length ? 0 : null,
  );
  const [comment, setComment] = React.useState<string>(props.route.params.event?.comment ?? '');
  const [isCreating, setCreating] = React.useState<boolean>(false);
  const [isDeleting, setDeleting] = React.useState<boolean>(false);

  const getIsEventEdited = (): boolean => {
    const { event, type } = props.route.params;

    if (!event) return false;
    if (type === EventType.LATENESS && !date.isSame(event.endDate)) return true;
    if (type === EventType.DEPARTURE && !date.isSame(event.startDate)) return true;
    return reasonId !== event.reasonId || comment !== event.comment;
  };

  const createEvent = async () => {
    try {
      const { navigation, session } = props;
      const { callId, course, event, student, type } = props.route.params;
      const start = type === EventType.DEPARTURE ? date : course.startDate;
      const end = type === EventType.LATENESS ? date : course.endDate;

      setCreating(true);
      if (!session) throw new Error();
      const absence = student.events.find(e => e.typeId === EventType.ABSENCE);
      if (type === EventType.LATENESS && absence) {
        await presencesService.event.delete(session, absence.id);
      }
      if (event && event.id) {
        if (type === EventType.ABSENCE) {
          await presencesService.eventReason.update(
            session,
            event.id,
            student.id,
            course.structureId,
            callId,
            type,
            start,
            end,
            reasonId,
          );
        } else {
          await presencesService.event.update(session, event.id, student.id, callId, type, start, end, reasonId, comment);
        }
      } else {
        await presencesService.event.create(session, student.id, callId, type, start, end, reasonId, comment);
      }
      await presencesService.classCall.updateStatus(session, callId, 2);
      navigation.goBack();
      if (isEventAlreadyExisting) Toast.showSuccess(I18n.get('presences-declareevent-eventedited'));
    } catch {
      setCreating(false);
      Toast.showError(I18n.get('presences-declareevent-error-text'));
    }
  };

  const deleteEvent = async () => {
    try {
      const { navigation, session } = props;
      const { callId, event } = props.route.params;

      setDeleting(true);
      if (!session || !event) throw new Error();
      await presencesService.event.delete(session, event.id);
      await presencesService.classCall.updateStatus(session, callId, 2);
      navigation.goBack();
    } catch {
      setDeleting(false);
      Toast.showError(I18n.get('presences-declareevent-error-text'));
    }
  };

  const getStatusTexts = () => {
    const { type } = props.route.params;

    switch (type) {
      case EventType.ABSENCE:
        return {
          deleteActionText: I18n.get('presences-declareevent-absence-delete'),
          reasonText: I18n.get('presences-declareevent-absence-reason'),
        };
      case EventType.LATENESS:
        return {
          deleteActionText: I18n.get('presences-declareevent-lateness-delete'),
          reasonText: I18n.get('presences-declareevent-lateness-reason'),
          timeText: I18n.get('presences-declareevent-lateness-time'),
        };
      case EventType.DEPARTURE:
        return {
          deleteActionText: I18n.get('presences-declareevent-departure-delete'),
          reasonText: I18n.get('presences-declareevent-departure-reason'),
          timeText: I18n.get('presences-declareevent-departure-time'),
        };
    }
  };

  const renderHeading = () => {
    const { student, type } = props.route.params;
    const color = type === EventType.ABSENCE ? theme.palette.status.failure.regular : theme.palette.status.warning.regular;
    const iconName = type === EventType.ABSENCE ? 'ui-error' : type === EventType.LATENESS ? 'ui-clock-alert' : 'ui-leave';

    return (
      <View style={styles.headingContainer}>
        <View style={styles.headingNameContainer}>
          <SingleAvatar size={36} userId={student.id} status={2} />
          <BodyText numberOfLines={1} style={[styles.headingNameText, { color }]}>
            {student.name}
          </BodyText>
        </View>
        <Picture type="NamedSvg" name={iconName} width={32} height={32} fill={color} />
      </View>
    );
  };

  const renderPage = () => {
    const { course, reasons, type } = props.route.params;
    const { deleteActionText, reasonText, timeText } = getStatusTexts();

    return (
      <ScrollView contentContainerStyle={styles.container}>
        {renderHeading()}
        <CallCard course={course} disabled />
        {type !== EventType.ABSENCE ? (
          <View style={styles.fieldContainer}>
            <SmallBoldText>{timeText}</SmallBoldText>
            <DateTimePicker
              mode="time"
              value={date}
              onChangeValue={value => setDate(value)}
              minimumDate={course.startDate}
              maximumDate={course.endDate}
              style={styles.timePickerContainer}
            />
          </View>
        ) : null}
        {(type === EventType.ABSENCE || type === EventType.LATENESS) && reasons.length ? (
          <View style={styles.fieldContainer}>
            <SmallBoldText>{reasonText}</SmallBoldText>
            <DropdownPicker
              open={isDropdownOpen}
              value={reasonId}
              items={[
                { label: I18n.get('presences-declareevent-withoutreason'), value: 0 },
                ...reasons.map(r => ({
                  label: r.label,
                  value: r.id,
                })),
              ]}
              setOpen={setDropdownOpen}
              setValue={setReasonId}
            />
          </View>
        ) : null}
        {type === EventType.DEPARTURE ? (
          <View style={styles.fieldContainer}>
            <SmallBoldText>{reasonText}</SmallBoldText>
            <TextInput
              placeholder={I18n.get('presences-declareevent-textinput-placeholder')}
              value={comment}
              onChangeText={text => setComment(text)}
            />
          </View>
        ) : null}
        <PrimaryButton
          text={I18n.get(isEventAlreadyExisting ? 'presences-declareevent-edit' : 'presences-declareevent-validate')}
          iconLeft="ui-check"
          action={createEvent}
          disabled={type !== EventType.ABSENCE && (date.isBefore(course.startDate) || date.isAfter(course.endDate))}
          loading={isCreating}
          style={styles.primaryActionContainer}
        />
        {isEventAlreadyExisting ? (
          <DefaultButton
            text={deleteActionText}
            iconLeft="ui-delete"
            contentColor={theme.palette.status.failure.regular}
            action={deleteEvent}
            loading={isDeleting}
            style={styles.deleteActionContainer}
          />
        ) : null}
      </ScrollView>
    );
  };

  const isEventEdited = getIsEventEdited();

  usePreventBack({
    title: I18n.get('presences-declareevent-confirmation-unsavedmodification-title'),
    text: I18n.get('presences-declareevent-confirmation-unsavedmodification-text'),
    showAlert: isEventEdited && !isCreating && !isDeleting,
  });

  const PageComponent = Platform.select<typeof KeyboardPageView | typeof PageView>({ ios: KeyboardPageView, android: PageView })!;

  return <PageComponent style={styles.pageContainer}>{renderPage()}</PageComponent>;
};

export default connect((state: IGlobalState) => {
  const session = getSession();

  return {
    session,
  };
})(PresencesDeclareEventScreen);
