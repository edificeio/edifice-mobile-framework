import DateTimePicker from "@react-native-community/datetimepicker";
import I18n from "i18n-js";
import moment from "moment";
import React, { useState } from "react";
import { View, StyleSheet, Platform, ViewStyle } from "react-native";

import { Icon, ButtonsOkCancel } from "./";
import TouchableOpacity from "./CustomTouchableOpacity";
import { ModalContent, ModalBox, ModalContentBlock, ModalContentText } from "./Modal";
import { Text } from "./text";

const styles = StyleSheet.create({
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
    <TouchableOpacity onPress={onPress} style={[styles.gridButton, { backgroundColor: color }]}>
      <Icon size={20} color="#2BAB6F" name={icon} />
      <Text style={{ marginHorizontal: 5 }}>{text}</Text>
    </TouchableOpacity>
  );
};

type DatePickerProps = {
  date: moment.Moment;
  minimumDate?: moment.Moment;
  maximumDate?: moment.Moment;
  onChangeDate: any;
  style?: ViewStyle;
};

const DatePickerIOS = ({ date, minimumDate, maximumDate, style, onChangeDate }: DatePickerProps) => {
  const [visible, toggleModal] = useState(false);
  const [selectedDate, changeDate] = useState(date);
  const [temporaryDate, changeTempDate] = useState(date);
  return (
    <View style={[styles.grid, style]}>
      <IconButton
        onPress={() => toggleModal(true)}
        text={selectedDate.format("DD/MM/YY")}
        color="white"
        icon="date_range"
      />
      <ModalBox isVisible={visible} onDismiss={() => toggleModal(false)}>
        <ModalContent style={{ width: 350 }}>
          <ModalContentBlock>
            <ModalContentText>{I18n.t("cdt-pickDate")}</ModalContentText>
          </ModalContentBlock>

          <View style={{ width: "100%", marginBottom: 35, paddingHorizontal: 20 }}>
            <DateTimePicker
              mode="date"
              maximumDate={maximumDate && maximumDate.toDate()}
              minimumDate={minimumDate && minimumDate.toDate()}
              value={temporaryDate.toDate()}
              onChange={(event, newDate) => {
                if (event.type === "dismissed") {
                  toggleModal(false);
                } else {
                  changeTempDate(moment(newDate));
                }
              }}
            />
          </View>
          <ModalContentBlock>
            <ButtonsOkCancel
              onCancel={() => {
                toggleModal(false);
              }}
              onValid={() => {
                toggleModal(false);
                changeDate(temporaryDate);
                onChangeDate(temporaryDate);
              }}
              title={I18n.t("common-ok")}
            />
          </ModalContentBlock>
        </ModalContent>
      </ModalBox>
    </View>
  );
};

const DatePickerAndroid = ({ date, minimumDate, style, maximumDate, onChangeDate }: DatePickerProps) => {
  const [visible, toggleModal] = useState(false);
  const [selectedDate, changeDate] = useState(date);
  return (
    <View style={[styles.grid, style]}>
      <IconButton
        onPress={() => toggleModal(true)}
        text={selectedDate.format("DD/MM/YY")}
        color="white"
        icon="date_range"
      />
      {visible && (
        <DateTimePicker
          mode="date"
          maximumDate={maximumDate && maximumDate.toDate()}
          minimumDate={minimumDate && minimumDate.toDate()}
          value={selectedDate.toDate()}
          onChange={(event, newDate) => {
            if (event.type === "dismissed") {
              toggleModal(false);
            } else {
              toggleModal(false);
              changeDate(moment(newDate));
              onChangeDate(moment(newDate));
            }
          }}
        />
      )}
    </View>
  );
};

export default (props: DatePickerProps) => {
  switch (Platform.OS) {
    case "ios": {
      return <DatePickerIOS {...props} />;
    }
    default: {
      return <DatePickerAndroid {...props} />;
    }
  }
};
