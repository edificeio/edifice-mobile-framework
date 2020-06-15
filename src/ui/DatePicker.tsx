import React from 'react';
import { View, StyleSheet, Button } from "react-native";
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import TouchableOpacity from "./CustomTouchableOpacity";
import { Text } from "./text";
import { Icon } from "./";

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
    elevation: 2
  },
});

const IconButton = ({ icon, color, text, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[style.gridButton, { backgroundColor: color }]}>
      <Icon size={20} color={"#2BAB6F"} name={icon} />
      <Text>{text}</Text>
    </TouchableOpacity>
  );
};

export class DatePicker extends React.PureComponent<any> {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
      show: false,
    }
  }

  private onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || this.state.date;
    this.setState({ date: currentDate, show: false });
    this.props.onGetDate(moment(this.state.date).format("YYYY-MM-DD"));
  };

  private onShowCalendar = () => {
    if (!this.state.show) {
      this.setState({ show: true });
    }
  }

  public render() {
    return (
      <View style={style.grid}>
        <IconButton onPress={this.onShowCalendar} text={moment(this.state.date).format("DD/MM/YY")} color="white" icon="reservation" />
        { this.state.show &&
          <DateTimePicker
            value={this.state.date}
            onChange={this.onChangeDate}
          />
        }
      </View>
    );
  }
};