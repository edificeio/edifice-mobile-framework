import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment, { Moment } from 'moment';
import * as React from 'react';
import { Platform, ScrollView, TextInput, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';

import { IGlobalState } from '~/app/store';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
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
  }),
  title: I18n.t(route.params.type === EventType.LATENESS ? 'viesco-lateness' : 'viesco-leaving'),
  headerStyle: {
    backgroundColor: viescoTheme.palette.presences,
  },
});

const PresencesDeclareEventScreen = (props: PresencesDeclareEventScreenPrivateProps) => {
  const [date, setDate] = React.useState<Moment>(moment());
  const [comment, setComment] = React.useState<string>(props.route.params.event?.comment ?? '');
  const [isCreating, setCreating] = React.useState<boolean>(false);
  const [isDeleting, setDeleting] = React.useState<boolean>(false);

  React.useEffect(() => {
    const { event, type } = props.route.params;

    if (event) {
      setDate(moment(type === EventType.LATENESS ? event.end_date : event.start_date));
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
      const absence = student.events.find(i => i.type_id === 1);
      if (type === EventType.LATENESS && absence) {
        await presencesService.event.delete(session, absence.id);
      }
      if (event === undefined) {
        await presencesService.event.create(session, student.id, callId, type, start, end, comment);
      } else {
        await presencesService.event.update(session, event.id!, student.id, callId, type, start, end, comment);
      }
      await presencesService.classCall.updateStatus(session, callId, 2);
      navigation.goBack();
    } catch {
      setCreating(false);
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
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
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const renderPage = () => {
    const { endDate, event, startDate, student, type } = props.route.params;
    const mainColor =
      type === EventType.LATENESS ? viescoTheme.palette.presencesEvents.lateness : viescoTheme.palette.presencesEvents.departure;
    const mainText = I18n.t(type === EventType.LATENESS ? 'viesco-arrived' : 'viesco-left');
    const inputLabel = I18n.t(type === EventType.LATENESS ? 'viesco-arrived-motive' : 'viesco-left-motive');

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
          <TextInput
            value={comment}
            onChangeText={text => setComment(text)}
            multiline
            textAlignVertical="top"
            style={styles.commentInput}
          />
        </View>
        <View style={styles.actionsContainer}>
          {event !== undefined ? (
            <ActionButton
              text={I18n.t('delete')}
              type="secondary"
              action={deleteEvent}
              loading={isDeleting}
              style={styles.deleteAction}
            />
          ) : null}
          <ActionButton
            text={I18n.t('viesco-confirm')}
            action={createEvent}
            disabled={!date.isBetween(startDate, endDate)}
            loading={isCreating}
          />
        </View>
      </ScrollView>
    );
  };

  const PageComponent = Platform.select({ ios: KeyboardPageView, android: PageView })!;

  return <PageComponent>{renderPage()}</PageComponent>;
};

export default connect((state: IGlobalState) => {
  const session = getSession(state);

  return {
    session,
  };
})(PresencesDeclareEventScreen);
