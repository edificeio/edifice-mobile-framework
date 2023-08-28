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
import { HeadingSText, SmallBoldText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import usePreventBack from '~/framework/hooks/usePreventBack';
import { getSession } from '~/framework/modules/auth/reducer';
import { CallCard } from '~/framework/modules/viescolaire/presences/components/CallCard';
import { EventType } from '~/framework/modules/viescolaire/presences/model';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { presencesService } from '~/framework/modules/viescolaire/presences/service';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import type { PresencesDeclareEventScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.declareEvent>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: route.params.title,
  }),
});

const PresencesDeclareEventScreen = (props: PresencesDeclareEventScreenPrivateProps) => {
  const [isEventAlreadyExisting] = React.useState<boolean>(props.route.params.event !== undefined);
  const [date, setDate] = React.useState<Moment>(moment());
  const [isDropdownOpen, setDropdownOpen] = React.useState<boolean>(false);
  const [reasonId, setReasonId] = React.useState<number | null>(props.route.params.event?.reasonId ?? null);
  const [comment, setComment] = React.useState<string>(props.route.params.event?.comment ?? '');
  const [isCreating, setCreating] = React.useState<boolean>(false);
  const [isDeleting, setDeleting] = React.useState<boolean>(false);

  React.useEffect(() => {
    const { event, type } = props.route.params;

    if (event) {
      setDate(type === EventType.LATENESS ? event.endDate : event.startDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIsEventEdited = (): boolean => {
    const { event } = props.route.params;

    if (!event) return false;
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

    if (type === EventType.ABSENCE) {
      return {
        deleteActionText: I18n.get('presences-declareevent-absence-delete'),
        reasonText: I18n.get('presences-declareevent-absence-reason'),
      };
    }
    return {
      deleteActionText: 'TODO',
      reasonText: 'TODO',
      timeText: 'TODO',
    };
  };

  const renderHeading = () => {
    const { type } = props.route.params;
    const color = type === EventType.ABSENCE ? theme.palette.status.failure.regular : theme.palette.status.warning.regular;
    const iconName = type === EventType.ABSENCE ? 'ui-error' : type === EventType.LATENESS ? 'ui-clock-alert' : 'ui-leave';
    const text = I18n.get(
      type === EventType.ABSENCE
        ? 'presences-declareevent-absence'
        : type === EventType.LATENESS
        ? 'presences-declareevent-lateness'
        : 'presences-declareevent-departure',
    );

    return (
      <View style={styles.headingContainer}>
        <Picture type="NamedSvg" name={iconName} width={32} height={32} fill={color} />
        <HeadingSText style={{ color }}>{text}</HeadingSText>
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
            <DateTimePicker mode="time" value={date} onChangeValue={value => setDate(value)} style={styles.timePickerContainer} />
          </View>
        ) : null}
        {(type === EventType.ABSENCE || type === EventType.LATENESS) && reasons.length ? (
          <View style={styles.fieldContainer}>
            <SmallBoldText>{reasonText}</SmallBoldText>
            <DropdownPicker
              open={isDropdownOpen}
              value={reasonId}
              items={reasons.map(r => ({
                label: r.label,
                value: r.id,
              }))}
              setOpen={setDropdownOpen}
              setValue={setReasonId}
              placeholder={I18n.get('presences-declareevent-dropdown-placeholder')}
            />
          </View>
        ) : null}
        {type === EventType.DEPARTURE ? (
          <View style={styles.fieldContainer}>
            <SmallBoldText>{reasonText}</SmallBoldText>
            <TextInput
              annotation={reasonText}
              value={comment}
              onChangeText={text => setComment(text)}
              multiline
              textAlignVertical="top"
            />
          </View>
        ) : null}
        <PrimaryButton
          text={I18n.get(isEventAlreadyExisting ? 'presences-declareevent-edit' : 'presences-declareevent-validate')}
          iconLeft="ui-check"
          action={createEvent}
          disabled={
            (type !== EventType.DEPARTURE && reasons.length && !reasonId) ||
            (type !== EventType.ABSENCE && !date.isBetween(course.startDate, course.endDate))
          }
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
