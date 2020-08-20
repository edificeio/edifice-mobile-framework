import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { Icon } from "../../../ui";
import ButtonOk from "../../../ui/ConfirmDialog/buttonOk";
import { PageContainer } from "../../../ui/ContainerContent";
import DateTimePicker from "../../../ui/DateTimePicker";
import { Text, TextBold, Label } from "../../../ui/Typography";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { LeftColoredItem } from "../../viesco/components/Item";
import { postLateEvent, updateLateEvent, postLeavingEvent, updateLeavingEvent, deleteEvent } from "../actions/events";

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
  navigation: NavigationScreenProp<any>;
};

export class DeclareEvent extends React.PureComponent<DeclarationProps, DeclarationState> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        title: navigation.getParam("title"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: <View />,
        headerStyle: {
          backgroundColor: navigation.getParam("color"),
        },
      },
      navigation
    );
  };

  constructor(props) {
    super(props);
    const { event } = props.navigation.state.params;
    if (event === undefined) {
      this.state = {
        date: new Date(),
        reason: "",
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
    const { declareLateness, declareLeaving, updateLateness, updateLeaving, deleteEvent } = this.props;
    const { type, student, event, registerId, startDate, endDate } = this.props.navigation.state.params;
    const momentDate = moment(date).second(0);
    const startDateMoment = moment(startDate).second(0);
    const endDateMoment = moment(endDate).second(0);
    if (type === "late") {
      if (event === undefined) {
        // deleting absence when lateness is declared
        const absence = student.events.find(i => i.type_id === 1);
        if (absence !== undefined) deleteEvent(absence);
        declareLateness(student.id, momentDate, reason, registerId, startDateMoment);
      } else {
        updateLateness(student.id, momentDate, reason, event.id, registerId, startDateMoment);
      }
    } else if (type === "leaving") {
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
    const { deleteEvent } = this.props;
    deleteEvent({ ...event, student_id: student.id });
    this.props.navigation.goBack();
  };

  getSpecificProperties(type) {
    const result = {
      mainColor: "",
      lightColor: "",
      mainText: "",
      inputLabel: "",
      title: "",
    };
    switch (type) {
      case "late":
        result.mainColor = "#9c2cb4";
        result.lightColor = "rgb(179, 0, 179)";
        result.title = I18n.t("viesco-lateness");
        result.mainText = I18n.t("viesco-arrived");
        result.inputLabel = I18n.t("viesco-arrived-motive");
        break;
      case "leaving":
        result.mainColor = "#24a1ac";
        result.lightColor = "#2dc5d2";
        result.title = I18n.t("viesco-leaving");
        result.mainText = I18n.t("viesco-left");
        result.inputLabel = I18n.t("viesco-left-motive");
        break;
    }
    return result;
  }

  public render() {
    const { date } = this.state;
    const { type, event, student, startDate, endDate } = this.props.navigation.state.params;
    const { mainColor, lightColor, mainText, inputLabel } = this.getSpecificProperties(type);
    const startDateString = moment(startDate).format("H:mm");
    const endDateString = moment(endDate).format("H:mm");
    return (
      <PageContainer>
        <KeyboardAvoidingView style={[style.container]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <LeftColoredItem color={mainColor} style={style.recapHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon color="grey" size={12} name="access_time" />
              <Text style={{ marginHorizontal: 5 }}>
                {startDateString} - {endDateString}
              </Text>
              <TextBold>{student.name}</TextBold>
            </View>
          </LeftColoredItem>
          <Text style={[style.underlinedText, { borderBottomColor: mainColor, color: mainColor }]}>{mainText}</Text>
          <DateTimePicker
            value={moment(date)}
            mode="time"
            onChange={this.onTimeChange}
            renderDate={date => (
              <View style={[style.timeView, { borderColor: lightColor }]}>
                <Text style={{ fontSize: 55, paddingVertical: 50, textDecorationLine: "underline" }}>
                  {date.format("HH : mm")}
                </Text>
              </View>
            )}
          />

          <View style={style.inputContainer}>
            <Label style={{ fontSize: 12 }}>{inputLabel}</Label>
            <TextInput
              defaultValue={event === undefined ? "" : event.comment}
              placeholder={I18n.t("viesco-enter-text")}
              underlineColorAndroid="lightgrey"
              onChangeText={this.onReasonChange}
            />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "nowrap" }}>
            {event !== undefined && <ButtonOk label={I18n.t("delete")} onPress={this.onCancel} />}
            <ButtonOk
              disabled={moment(this.state.date).isBefore(startDate) || moment(this.state.date).isAfter(endDate)}
              label={I18n.t("viesco-confirm")}
              onPress={this.onSubmit}
            />
          </View>
        </KeyboardAvoidingView>
      </PageContainer>
    );
  }
}

const style = StyleSheet.create({
  container: {
    flexDirection: "column",
    flexWrap: "nowrap",
    alignItems: "stretch",
    justifyContent: "flex-end",
  },
  recapHeader: {
    marginTop: 10,
    paddingVertical: 12,
    alignSelf: "flex-end",
    width: "90%",
    marginBottom: 15,
  },
  underlinedText: {
    alignSelf: "center",
    borderBottomWidth: 2,
    padding: 10,
  },
  inputContainer: {
    marginHorizontal: 30,
    marginBottom: 20,
  },
  timeView: {
    margin: 40,
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "solid",
    borderRadius: 3,
    backgroundColor: "white",
  },
});

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
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DeclareEvent);
