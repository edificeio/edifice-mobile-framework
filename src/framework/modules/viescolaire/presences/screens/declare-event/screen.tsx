import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { ActionButton } from '~/framework/components/buttons/action';
import { PageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { CaptionText, SmallBoldText, SmallText } from '~/framework/components/text';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { LeftColoredItem } from '~/modules/viescolaire/dashboard/components/Item';
import {
  deleteEvent,
  postLateEvent,
  postLeavingEvent,
  updateLateEvent,
  updateLeavingEvent,
} from '~/modules/viescolaire/presences/actions/events';
import DateTimePicker from '~/ui/DateTimePicker';

import styles from './styles';
import { PresencesDeclareEventScreenPrivateProps } from './types';

type PresencesDeclareEventScreenState = {
  date: Date;
  reason: string;
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.declareEvent>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: route.params.title,
  headerStyle: {
    backgroundColor: route.params.color,
  },
});

export class PresencesDeclareEventScreen extends React.PureComponent<
  PresencesDeclareEventScreenPrivateProps,
  PresencesDeclareEventScreenState
> {
  constructor(props) {
    super(props);
    const { event } = props.navigation.state.params;
    if (event === undefined) {
      this.state = {
        date: new Date(),
        reason: '',
      };
    } else {
      if (event.type_id === 2) this.state = { date: moment(event.end_date).toDate(), reason: event.comment };
      else if (event.type_id === 3) this.state = { date: moment(event.start_date).toDate(), reason: event.comment };
    }
  }

  componentDidMount() {
    const properties = this.getSpecificProperties(this.props.route.params.type);
    this.props.navigation.setParams({
      title: properties.title,
      color: properties.mainColor,
    });
  }

  onTimeChange = selectedDate => {
    const { date } = this.state;
    const currentDate = selectedDate || date;
    this.setState({
      date: currentDate,
    });
  };

  onReasonChange = value => {
    this.setState({
      reason: value,
    });
  };

  onSubmit = () => {
    const { date, reason } = this.state;
    const { declareLateness, declareLeaving, updateLateness, updateLeaving } = this.props;
    const { type, student, event, registerId, startDate, endDate } = this.props.route.params;
    const momentDate = moment(date).second(0);
    const startDateMoment = moment(startDate).second(0);
    const endDateMoment = moment(endDate).second(0);
    if (type === 'late') {
      if (event === undefined) {
        // deleting absence when lateness is declared
        const absence = student.events.find(i => i.type_id === 1);
        if (absence !== undefined) this.props.deleteEvent(absence);
        declareLateness(student.id, momentDate, reason, registerId, startDateMoment);
      } else {
        updateLateness(student.id, momentDate, reason, event.id, registerId, startDateMoment);
      }
    } else if (type === 'leaving') {
      if (event === undefined) {
        declareLeaving(student.id, momentDate, reason, registerId, endDateMoment);
      } else {
        updateLeaving(student.id, momentDate, reason, event.id, registerId, endDateMoment);
      }
    }
    this.props.navigation.goBack();
  };

  onCancel = () => {
    const { event, student } = this.props.route.params;
    this.props.deleteEvent({ ...event, student_id: student.id });
    this.props.navigation.goBack();
  };

  getSpecificProperties(type) {
    const result = {
      mainColor: '',
      lightColor: '',
      mainText: '',
      inputLabel: '',
      title: '',
    };
    switch (type) {
      case 'late':
        result.mainColor = viescoTheme.palette.presencesEvents.lateness;
        result.lightColor = viescoTheme.palette.presencesEvents.lateness;
        result.title = I18n.t('viesco-lateness');
        result.mainText = I18n.t('viesco-arrived');
        result.inputLabel = I18n.t('viesco-arrived-motive');
        break;
      case 'leaving':
        result.mainColor = viescoTheme.palette.presencesEvents.departure;
        result.lightColor = viescoTheme.palette.presencesEvents.departure;
        result.title = I18n.t('viesco-leaving');
        result.mainText = I18n.t('viesco-left');
        result.inputLabel = I18n.t('viesco-left-motive');
        break;
    }
    return result;
  }

  public render() {
    const { date } = this.state;
    const { type, event, student, startDate, endDate } = this.props.route.params;
    const { mainColor, mainText, inputLabel } = this.getSpecificProperties(type);
    const startDateString = moment(startDate).format('HH:mm');
    const endDateString = moment(endDate).format('HH:mm');

    return (
      <PageView>
        <KeyboardAvoidingView
          enabled={Platform.OS === 'ios'}
          behavior="padding"
          keyboardVerticalOffset={60}
          style={styles.safeAreaContainer}>
          <ScrollView>
            <LeftColoredItem color={mainColor} style={styles.recapHeader}>
              <View style={styles.recapHeaderView}>
                <Picture type="NamedSvg" name="ui-clock" width={20} height={20} fill={mainColor} />
                <SmallText style={styles.recapHeaderText}>
                  {startDateString} - {endDateString}
                </SmallText>
                <SmallBoldText>{student.name}</SmallBoldText>
              </View>
            </LeftColoredItem>
            <View style={styles.timePickerRowContainer}>
              <SmallText style={[styles.timePickerText, { color: mainColor }]}>{mainText}</SmallText>
              <DateTimePicker mode="time" value={moment(date)} onChange={this.onTimeChange} color={mainColor} />
            </View>
            <View style={styles.inputContainer}>
              <CaptionText style={styles.labelText}>{inputLabel}</CaptionText>
              <TextInput
                defaultValue={event === undefined ? '' : event.comment}
                placeholder={I18n.t('viesco-enter-text')}
                style={styles.reasonTextInput}
                multiline
                onChangeText={this.onReasonChange}
              />
            </View>
            <View style={styles.buttonOkContainer}>
              {event !== undefined ? (
                <ActionButton text={I18n.t('delete')} type="secondary" action={this.onCancel} style={styles.deleteButton} />
              ) : null}
              <ActionButton
                text={I18n.t('viesco-confirm')}
                action={this.onSubmit}
                disabled={moment(this.state.date).isBefore(startDate) || moment(this.state.date).isAfter(endDate)}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </PageView>
    );
  }
}

export default connect((dispatch: ThunkDispatch<any, any, any>) =>
  bindActionCreators(
    {
      declareLateness: tryAction(postLateEvent, undefined, true),
      updateLateness: tryAction(updateLateEvent, undefined, true),
      declareLeaving: tryAction(postLeavingEvent, undefined, true),
      updateLeaving: tryAction(updateLeavingEvent, undefined, true),
      deleteEvent: tryAction(deleteEvent, undefined, true),
    },
    dispatch,
  ),
)(PresencesDeclareEventScreen);
