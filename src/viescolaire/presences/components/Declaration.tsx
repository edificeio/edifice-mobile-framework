import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Keyboard, Platform } from "react-native";
import { TextInput, ScrollView } from "react-native-gesture-handler";

import { CommonStyles } from "../../../styles/common/styles";
import { DialogButtonOk } from "../../../ui/ConfirmDialog";
import ConnectionTrackingBar from "../../../ui/ConnectionTrackingBar";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import DateTimePicker from "../../../ui/DateTimePicker";
import { Text, TextBold } from "../../../ui/Typography";

type DeclarationProps = {
  startDate: moment.Moment;
  updateStartDate: any;
  endDate: moment.Moment;
  updateEndDate: any;
  comment: string;
  updateComment: any;
  submit: () => void;
  validate: () => boolean;
};

enum SwitchState {
  SINGLE,
  SEVERAL,
}

type DeclarationState = {
  switchState: SwitchState;
};

export default class AbsenceDeclaration extends React.PureComponent<DeclarationProps, DeclarationState> {
  constructor(props) {
    super(props);
    this.state = {
      switchState: SwitchState.SINGLE,
    };
  }

  public componentDidUpdate(prevProps: DeclarationProps, prevState: DeclarationState) {
    const singleDay = this.state.switchState === SwitchState.SINGLE;
    const differentDay =
      this.props.endDate.year() !== this.props.startDate.year() ||
      this.props.endDate.dayOfYear() !== this.props.startDate.dayOfYear();

    if (singleDay && differentDay) {
      this.props.updateEndDate(
        moment(this.props.endDate)
          .year(this.props.startDate.year())
          .dayOfYear(this.props.startDate.dayOfYear())
      );
    }
  }

  public render() {
    const { startDate, updateStartDate, endDate, updateEndDate, comment, updateComment, submit } = this.props;

    const RightSwitchComponent = () => (
      <TouchableOpacity
        style={[
          styles.switchPart,
          styles.rightSwitch,
          this.state.switchState == SwitchState.SEVERAL && styles.selected,
        ]}
        onPress={() => this.setState({ switchState: SwitchState.SEVERAL })}>
        {this.state.switchState == SwitchState.SINGLE ? (
          <View style={{ flexDirection: "row" }}>
            <Text>{I18n.t("viesco-several-days")}</Text>
            <TextBold style={{ marginHorizontal: 10 }}>+</TextBold>
          </View>
        ) : (
          <View>
            <Text>{I18n.t("viesco-several-days")}</Text>
            <TextBold>
              {I18n.t("viesco-from")} {startDate.format("DD/MM")} {I18n.t("viesco-to")} {endDate.format("DD/MM")}
            </TextBold>
          </View>
        )}
      </TouchableOpacity>
    );

    const LeftSwitchComponent = () => (
      <TouchableOpacity
        style={[styles.switchPart, styles.leftSwitch, this.state.switchState == SwitchState.SINGLE && styles.selected]}
        onPress={() => this.setState({ switchState: SwitchState.SINGLE })}>
        <Text>{I18n.t("viesco-single-day")}</Text>
        <TextBold>{startDate.format("DD/MM")}</TextBold>
      </TouchableOpacity>
    );

    const TimePickerComponent = ({ time, onChange, title }) => (
      <DateTimePicker
        value={time}
        style={{
          flex: 1,
          justifyContent: "space-evenly",
          backgroundColor: "white",
          alignItems: "center",
          margin: 10,
        }}
        renderDate={date => (
          <>
            <View
              style={{
                borderStyle: "solid",
                borderBottomWidth: 2,
                borderColor: "#FCB602",
                padding: 10,
              }}>
              <Text style={{ color: "#FCB602", textTransform: "uppercase" }}>{title}</Text>
            </View>
            <TextBold style={{ padding: 10, fontSize: 24 }}>{date.format("HH    :    mm")}</TextBold>
          </>
        )}
        mode="time"
        onChange={onChange}
      />
    );

    const DatePickers = () => (
      <>
        {this.state.switchState === SwitchState.SINGLE ? (
          <DateTimePicker
            mode="date"
            value={startDate}
            minimumDate={moment().startOf("day")}
            onChange={updateStartDate}
          />
        ) : (
          <>
            <DateTimePicker
              mode="date"
              value={startDate}
              minimumDate={moment().startOf("day")}
              maximumDate={endDate}
              onChange={updateStartDate}
            />
            <DateTimePicker mode="date" value={endDate} minimumDate={startDate} onChange={updateEndDate} />
          </>
        )}
      </>
    );

    return (
      <SafeAreaView>
        <ConnectionTrackingBar />
        <KeyboardAvoidingView enabled={Platform.OS === "ios"} behavior="position" keyboardVerticalOffset={60}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="never">
            <View style={[styles.row, styles.switchContainer]}>
              <LeftSwitchComponent />
              <RightSwitchComponent />
            </View>

            <View style={styles.row}>
              <DatePickers />
            </View>

            <View style={styles.row}>
              <TimePickerComponent title={I18n.t("viesco-from-hour")} time={startDate} onChange={updateStartDate} />
              <TimePickerComponent title={I18n.t("viesco-to-hour")} time={endDate} onChange={updateEndDate} />
            </View>

            <View style={[styles.row, styles.inputContainer]}>
              <TextBold style={{ marginBottom: 10 }}>{I18n.t("viesco-absence-motive")}</TextBold>
              <TextInput
                multiline
                placeholder={I18n.t("viesco-enter-text")}
                value={comment}
                underlineColorAndroid="lightgrey"
                onChangeText={updateComment}
              />
            </View>

            <DialogButtonOk
              style={{ alignSelf: "center" }}
              disabled={!this.props.validate()}
              label={I18n.t("viesco-validate")}
              onPress={submit}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  switchContainer: {
    justifyContent: "center",
    padding: 10,
  },
  switchPart: {
    flex: 1,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "lightgrey",
    padding: 15,
    justifyContent: "center",
  },
  leftSwitch: {
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
  },
  rightSwitch: {
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
  },
  selected: {
    backgroundColor: "white",
    elevation: CommonStyles.elevation,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
  },
  row: {
    marginVertical: 10,
    justifyContent: "space-evenly",
    flexDirection: "row",
  },
  column: {
    flexDirection: "column",
    alignItems: "center",
    padding: 15,
    flexGrow: 1,
    flexBasis: 0,
  },
  timeContainer: {
    backgroundColor: "white",
    flexDirection: "column",
    alignItems: "center",
    padding: 30,
  },
  inputContainer: {
    backgroundColor: "white",
    flexDirection: "column",
    padding: 25,
  },
});
