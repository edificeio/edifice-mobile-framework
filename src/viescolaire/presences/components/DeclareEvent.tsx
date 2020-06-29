import DateTimePicker from "@react-native-community/datetimepicker";
import I18n, { t } from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { Icon } from "../../../ui";
import ButtonOk from "../../../ui/ConfirmDialog/buttonOk";
import { PageContainer } from "../../../ui/ContainerContent";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import { Text, TextBold, Label } from "../../../ui/Typography";
import { LeftColoredItem } from "../../viesco/components/Item";
import { postLateEvent, updateLateEvent, postLeavingEvent, deleteEvent } from "../actions/events";

type DeclarationState = {
  showPicker: boolean;
  date: Date;
  reason: string;
};

type DeclarationProps = {
  type: "late" | "leaving";
  declareLateness: any;
  updateLateness: any;
  declareLeaving: any;
  updateLeaving: any;
  deleteEvent: any;
  studentId: string;
  eventId: string;
  registerId: string;
};

export class DeclareEvent extends React.PureComponent<DeclarationProps, DeclarationState> {
  constructor(props) {
    super(props);
    this.state = {
      showPicker: false,
      date: new Date(),
      reason: "",
    };
  }

  onTimeChange = (event, selectedDate) => {
    const { date } = this.state;
    const currentDate = selectedDate || date;
    this.setState({
      showPicker: false,
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
    const {
      type,
      declareLateness,
      declareLeaving,
      updateLateness,
      updateLeaving,
      studentId,
      eventId,
      registerId,
    } = this.props;
    const momentDate = moment(date);
    if (type === "late") {
      if (eventId === undefined) {
        declareLateness(studentId, momentDate, reason, registerId, moment());
      } else {
        updateLateness(studentId, momentDate, reason, registerId, moment());
      }
    } else if (type === "leaving") {
      if (eventId === undefined) {
        declareLeaving(studentId, momentDate, reason, registerId, moment());
      } else {
        updateLeaving(studentId, momentDate, reason, registerId, moment());
      }
    }
  };

  onCancel = () => {
    const { deleteEvent, registerId, eventId } = this.props;
    deleteEvent(registerId, eventId);
  };

  getSpecificProperties(type) {
    const result = {
      mainColor: "",
      lightColor: "",
      mainText: "",
      inputLabel: "",
    };
    switch (type) {
      case "late":
        result.mainColor = "#9c2cb4";
        result.lightColor = "rgb(179, 0, 179)";
        result.mainText = I18n.t("viesco-arrived");
        result.inputLabel = I18n.t("viesco-arrived-motive");
        break;
      case "leaving":
        result.mainColor = "#24a1ac";
        result.lightColor = "#2dc5d2";
        result.mainText = I18n.t("viesco-left");
        result.inputLabel = I18n.t("viesco-left-motive");
        break;
    }
    return result;
  }

  public render() {
    const { showPicker, date } = this.state;
    const { eventId } = this.props;
    const { mainColor, lightColor, mainText, inputLabel } = this.getSpecificProperties("late");
    return (
      <PageContainer>
        <KeyboardAvoidingView style={[style.container]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          {showPicker && <DateTimePicker value={date} mode="time" display="spinner" onChange={this.onTimeChange} />}
          <LeftColoredItem color={mainColor} style={style.recapHeader}>
            <Text>
              <Icon color="grey" size={12} name="access_time" />
              <Text> 8:30 - 9:25 </Text>
              <TextBold>BERRADA RKHAMI Farah</TextBold>
            </Text>
          </LeftColoredItem>
          <Text style={[style.underlinedText, { borderBottomColor: mainColor, color: mainColor }]}>{mainText}</Text>
          <TouchableOpacity onPress={() => this.setState({ showPicker: true })}>
            <View style={[style.timeView, { borderColor: lightColor }]}>
              <Text style={{ fontSize: 55, paddingVertical: 50, textDecorationLine: "underline" }}>
                {date.getHours()} : {(date.getMinutes() < 10 ? "0" : "") + date.getMinutes()}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={style.inputContainer}>
            <Label style={{ fontSize: 12 }}>{inputLabel}</Label>
            <TextInput
              placeholder={I18n.t("viesco-enter-text")}
              underlineColorAndroid="lightgrey"
              onChangeText={this.onReasonChange}
            />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "nowrap" }}>
            {eventId !== undefined && <ButtonOk label={I18n.t("delete")} onPress={this.onCancel} />}
            <ButtonOk label={I18n.t("viesco-confirm")} onPress={this.onSubmit} />
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
      updateLeaving: postLeavingEvent,
      deleteEvent,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DeclareEvent);
