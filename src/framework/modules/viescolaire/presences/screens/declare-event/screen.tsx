import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment, { Moment } from 'moment';
import * as React from 'react';
import { Platform, ScrollView, TextInput, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { ActionButton } from '~/framework/components/buttons/action';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { getSession } from '~/framework/modules/auth/reducer';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { LeftColoredItem } from '~/framework/modules/viescolaire/dashboard/components/Item';
import { EventType } from '~/framework/modules/viescolaire/presences/model';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { presencesService } from '~/framework/modules/viescolaire/presences/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import DateTimePicker from '~/ui/DateTimePicker';

import styles from './styles';
import { PresencesDeclareEventScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.declareEvent>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get(
      route.params.type === EventType.LATENESS ? 'presences-declareevent-lateness-title' : 'presences-declareevent-departure-title',
    ),
  }),
});

const PresencesDeclareEventScreen = (props: PresencesDeclareEventScreenPrivateProps) => {
  const [date, setDate] = React.useState<Moment>(moment());
  const [isDropdownOpen, setDropdownOpen] = React.useState<boolean>(false);
  const [reason, setReason] = React.useState<number | null>(props.route.params.event?.reasonId ?? null);
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

  const createEvent = async () => {
    try {
      const { navigation, session } = props;
      const { callId, endDate, event, startDate, student, type } = props.route.params;
      const start = type === EventType.LATENESS ? startDate : date;
      const end = type === EventType.LATENESS ? date : endDate;

      setCreating(true);
      if (!session) throw new Error();
      const absence = student.events.find(e => e.typeId === EventType.ABSENCE);
      if (type === EventType.LATENESS && absence) {
        await presencesService.event.delete(session, absence.id);
      }
      if (event && event.id) {
        await presencesService.event.update(session, event.id, student.id, callId, type, start, end, reason, comment);
      } else {
        await presencesService.event.create(session, student.id, callId, type, start, end, reason, comment);
      }
      await presencesService.classCall.updateStatus(session, callId, 2);
      navigation.goBack();
    } catch {
      setCreating(false);
      Toast.showError(I18n.get('common.error.text'));
    }
  };

  const deleteEvent = async () => {
    try {
      const { navigation, session } = props;
      const { callId, event } = props.route.params;

      setDeleting(true);
      if (!session || !event) throw new Error();
      await presencesService.event.delete(session, event.id!);
      await presencesService.classCall.updateStatus(session, callId, 2);
      navigation.goBack();
    } catch {
      setDeleting(false);
      Toast.showError(I18n.get('common.error.text'));
    }
  };

  const renderPage = () => {
    const { endDate, event, reasons, startDate, student, type } = props.route.params;
    const mainColor =
      type === EventType.LATENESS ? viescoTheme.palette.presencesEvents.lateness : viescoTheme.palette.presencesEvents.departure;
    const mainText = I18n.get(
      type === EventType.LATENESS ? 'presences-declareevent-lateness-arrived' : 'presences-declareevent-departure-left',
    );
    const inputLabel = I18n.get(
      type === EventType.LATENESS ? 'presences-declareevent-lateness-reason' : 'presences-declareevent-departure-reason',
    );

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <LeftColoredItem color={mainColor} style={styles.recapHeader}>
            <View style={styles.recapHeaderView}>
              <Picture type="NamedSvg" name="ui-clock" width={20} height={20} fill={mainColor} />
              <SmallText style={styles.recapHeaderText}>{`${startDate.format('HH:mm')} - ${endDate.format('HH:mm')}`}</SmallText>
              <SmallBoldText>{student.name}</SmallBoldText>
            </View>
          </LeftColoredItem>
          <View style={styles.timePickerRowContainer}>
            <SmallText style={[styles.timePickerText, { color: mainColor }]}>{mainText}</SmallText>
            <DateTimePicker mode="time" value={date} onChange={value => setDate(value)} color={mainColor} />
          </View>
          <SmallText style={styles.commentText}>{inputLabel}</SmallText>
          {type === EventType.LATENESS ? (
            <DropDownPicker
              open={isDropdownOpen}
              value={reason}
              items={
                reasons?.map(r => ({
                  label: r.label,
                  value: r.id,
                })) ?? []
              }
              setOpen={setDropdownOpen}
              setValue={setReason}
              placeholder={I18n.get('presences-declareevent-lateness-noreason')}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdown}
              textStyle={styles.dropdownText}
            />
          ) : (
            <TextInput
              value={comment}
              onChangeText={text => setComment(text)}
              multiline
              textAlignVertical="top"
              style={styles.commentInput}
            />
          )}
        </View>
        <View style={styles.actionsContainer}>
          {event !== undefined ? (
            <ActionButton
              text={I18n.get('presences-declareevent-delete')}
              type="secondary"
              action={deleteEvent}
              loading={isDeleting}
              style={styles.deleteAction}
            />
          ) : null}
          <ActionButton
            text={I18n.get('presences-declareevent-action')}
            action={createEvent}
            disabled={!date.isBetween(startDate, endDate)}
            loading={isCreating}
          />
        </View>
      </ScrollView>
    );
  };

  const PageComponent = Platform.select<typeof KeyboardPageView | typeof PageView>({ ios: KeyboardPageView, android: PageView })!;

  return <PageComponent>{renderPage()}</PageComponent>;
};

export default connect((state: IGlobalState) => {
  const session = getSession();

  return {
    session,
  };
})(PresencesDeclareEventScreen);
