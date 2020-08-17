import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";

import { DialogButtonOk } from "../../../ui/ConfirmDialog";
import DateTimePicker from "../../../ui/DateTimePicker";
import { Text, TextBold } from "../../../ui/Typography";
import { CommonStyles } from "../../../styles/common/styles";
import ConnectionTrackingBar from "../../../ui/ConnectionTrackingBar";

type DeclarationProps = {
  startDate: moment.Moment;
  updateStartDate: any;
  endDate: moment.Moment;
  updateEndDate: any;
  comment: string;
  updateComment: any;
  submit: () => void;
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
    if (prevState.switchState != this.state.switchState && this.state.switchState == SwitchState.SINGLE) {
      this.props.updateEndDate(this.props.startDate);
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
              Du {startDate.format("DD/MM")} Au {endDate.format("DD/MM")}
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
        style={{ flex: 1, justifyContent: "space-evenly", backgroundColor: "white", alignItems: "center", margin: 15 }}
        renderDate={date => (
          <>
            <View
              style={{
                borderStyle: "solid",
                borderBottomWidth: 2,
                borderColor: "#FCB602",
                padding: 5,
              }}>
              <Text style={{ color: "#FCB602", textTransform: "uppercase" }}>{title}</Text>
            </View>
            <TextBold style={{ fontSize: 24 }}>{date.format("HH    :    mm")}</TextBold>
          </>
        )}
        mode="time"
        onChange={onChange}
      />
    );

    const DatePickers = () => (
      <>
        {this.state.switchState == SwitchState.SINGLE ? (
          <DateTimePicker mode="date" value={startDate} minimumDate={moment()} onChange={updateStartDate} />
        ) : (
          <>
            <DateTimePicker mode="date" value={startDate} maximumDate={endDate} onChange={updateStartDate} />
            <DateTimePicker mode="date" value={endDate} minimumDate={startDate} onChange={updateEndDate} />
          </>
        )}
      </>
    );

    return (
      <SafeAreaView
        style={{
          backgroundColor: CommonStyles.lightGrey,
          flex: 1,
        }}>
        <ConnectionTrackingBar />
        <View style={[styles.row, styles.switchContainer]}>
          <LeftSwitchComponent />
          <RightSwitchComponent />
        </View>
        <View style={styles.row}>
          <DatePickers />
        </View>
        <View style={[styles.row, { flex: 1 }]}>
          <TimePickerComponent title={I18n.t("viesco-from-hour")} time={startDate} onChange={updateStartDate} />
          <TimePickerComponent title={I18n.t("viesco-to-hour")} time={endDate} onChange={updateEndDate} />
        </View>
        <View style={[styles.row, styles.inputContainer, { flexBasis: "40%", justifyContent: "flex-start" }]}>
          <Text>{I18n.t("viesco-absence-motive")}</Text>
          <TextInput
            multiline={true}
            placeholder={I18n.t("viesco-enter-text")}
            value={comment}
            underlineColorAndroid="lightgrey"
            onChangeText={updateComment}
          />
        </View>
        <DialogButtonOk
          style={{ alignSelf: "center" }}
          disabled={this.props.startDate.isAfter(this.props.endDate)}
          label={I18n.t("viesco-validate")}
          onPress={submit}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  switchContainer: {
    justifyContent: "center",
    paddingHorizontal: 20,
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
    marginVertical: 15,
    flexDirection: "row",
    justifyContent: "space-evenly",
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
