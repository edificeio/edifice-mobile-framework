import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { Icon } from '~/framework/components/picture/Icon';
import { CaptionText, SmallBoldText, SmallText } from '~/framework/components/text';
import { LeftColoredItem } from '~/modules/viescolaire/dashboard/components/Item';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';
import {
  deleteEvent,
  postLateEvent,
  postLeavingEvent,
  updateLateEvent,
  updateLeavingEvent,
} from '~/modules/viescolaire/presences/actions/events';
import DateTimePicker from '~/ui/DateTimePicker';

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  recapHeader: {
    paddingVertical: UI_SIZES.spacing.small,
    alignSelf: 'flex-end',
    width: '90%',
    marginBottom: UI_SIZES.spacing.medium,
  },
  recapHeaderView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recapHeaderText: {
    marginHorizontal: UI_SIZES.spacing.tiny,
  },
  timePickerRowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: UI_SIZES.spacing.small,
  },
  timePickerText: {
    marginRight: UI_SIZES.spacing.minor,
  },
  inputContainer: {
    marginHorizontal: UI_SIZES.spacing.large,
  },
  labelText: {
    marginTop: UI_SIZES.spacing.big,
    marginBottom: UI_SIZES.spacing.tiny,
  },
  reasonTextInput: {
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey.cloudy,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  buttonOkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    marginVertical: UI_SIZES.spacing.big,
  },
  deleteButton: {
    marginRight: UI_SIZES.spacing.medium,
  },
});

type DeclarationState = {
  date: Date;
  reason: string;
};

type DeclarationProps = {
  declareLateness: any;
  updateLateness: any;
  declareLeaving: any;
  updateLeaving: any;
  deleteEvent: any;
} & NavigationInjectedProps<any>;

export class DeclareEvent extends React.PureComponent<DeclarationProps, DeclarationState> {
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
    const properties = this.getSpecificProperties(this.props.navigation.state.params.type);
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
    const { type, student, event, registerId, startDate, endDate } = this.props.navigation.state.params;
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
    const { event, student } = this.props.navigation.state.params;
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
    const { type, event, student, startDate, endDate } = this.props.navigation.state.params;
    const { mainColor, mainText, inputLabel } = this.getSpecificProperties(type);
    const startDateString = moment(startDate).format('HH:mm');
    const endDateString = moment(endDate).format('HH:mm');

    const navBarInfo = {
      title: this.props.navigation.getParam('title'),
      style: {
        backgroundColor: this.props.navigation.getParam('color'),
      },
    };

    return (
      <PageView navigation={this.props.navigation} navBarWithBack={navBarInfo}>
        <KeyboardAvoidingView
          enabled={Platform.OS === 'ios'}
          behavior="padding"
          keyboardVerticalOffset={60}
          style={styles.safeAreaContainer}>
          <ScrollView>
            <LeftColoredItem color={mainColor} style={styles.recapHeader}>
              <View style={styles.recapHeaderView}>
                <Icon color="grey" size={12} name="access_time" />
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

const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      declareLateness: postLateEvent,
      updateLateness: updateLateEvent,
      declareLeaving: postLeavingEvent,
      updateLeaving: updateLeavingEvent,
      deleteEvent,
    },
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DeclareEvent);
