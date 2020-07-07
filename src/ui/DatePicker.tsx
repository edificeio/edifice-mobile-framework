import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import React from "react";
import { View, StyleSheet } from "react-native";

import { Icon } from "./";
import TouchableOpacity from "./CustomTouchableOpacity";
import { Text } from "./text";

const style = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridButton: {
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    elevation: 2,
  },
});

const IconButton = ({ icon, color, text, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[style.gridButton, { backgroundColor: color }]}>
      <Icon size={20} color="#2BAB6F" name={icon} />
      <Text>{text}</Text>
    </TouchableOpacity>
  );
};

type DatePickerProps = {
  date: moment.Moment;
  startDate?: moment.Moment;
  endDate?: moment.Moment;
  onGetDate: any;
};

type DatePickerState = {
  date: moment.Moment;
  show: boolean;
};

export class DatePicker extends React.PureComponent<DatePickerProps, DatePickerState> {
  constructor(props) {
    super(props);

    this.state = {
      date: this.props.date,
      show: false,
    };
  }

  private onChangeDate = (event, selectedDate) => {
    if (event.type === "dismissed") {
      this.setState({ show: false });
    } else {
      this.setState({ date: moment(selectedDate), show: false });
      this.props.onGetDate(this.state.date);
    }
  };

  private onShowCalendar = () => {
    if (!this.state.show) {
      this.setState({ show: true });
    }
  };

  public render() {
    return (
      <View style={style.grid}>
        <IconButton
          onPress={this.onShowCalendar}
          text={this.state.date.format("DD/MM/YY")}
          color="white"
          icon="reservation"
        />
        {this.state.show && this.props.endDate !== undefined && (
          <DateTimePicker
            maximumDate={this.props.endDate.toDate()}
            value={this.state.date.toDate()}
            onChange={this.onChangeDate}
          />
        )}
        {this.state.show && this.props.startDate !== undefined && (
          <DateTimePicker
            minimumDate={this.props.startDate.toDate()}
            value={this.state.date.toDate()}
            onChange={this.onChangeDate}
          />
        )}
      </View>
    );
  }
}
