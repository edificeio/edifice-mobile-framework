import DateTimePicker from "@react-native-community/datetimepicker";
import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import DocumentPicker, { DocumentPickerResponse } from "react-native-document-picker";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";

import { DialogButtonOk } from "../../../ui/ConfirmDialog";
import { PageContainer } from "../../../ui/ContainerContent";
import { DatePicker } from "../../../ui/DatePicker";
import { Text, TextBold } from "../../../ui/Typography";

type DeclarationProps = {
  singleDay: boolean;
  onSingleDaySwitch: any;
  startDate: moment.Moment;
  endDate: moment.Moment;
  comment: string;
  updateStartDate: any;
  updateEndDate: any;
  updateComment: any;
  onFilesPicked: any;
  onFileDelete: any;
  validate: any;
  files: DocumentPickerResponse[];
};

type DeclarationState = {
  showStartTimePicker: boolean;
  showEndTimePicker: boolean;
};

export default class AbsenceDeclaration extends React.PureComponent<DeclarationProps, DeclarationState> {
  constructor(props) {
    super(props);
    this.state = {
      showStartTimePicker: false,
      showEndTimePicker: false,
    };
  }

  onDocumentPickerClick = async () => {
    try {
      const results = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      });
      this.props.onFilesPicked(results);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // handle error
      } else {
        throw err;
      }
    }
  };

  onSingleDayPress = () => {
    const { onSingleDaySwitch, singleDay } = this.props;
    if (!singleDay) return onSingleDaySwitch();
    this.setState({
      showStartTimePicker: true,
    });
  };

  onSeveralDaysPress = () => {
    const { onSingleDaySwitch, singleDay } = this.props;
    if (singleDay) return onSingleDaySwitch();
    this.setState({
      showEndTimePicker: true,
    });
  };

  onStartTimePress = () => {
    this.setState({
      showStartTimePicker: true,
    });
  };

  onEndTimePress = () => {
    this.setState({
      showEndTimePicker: true,
    });
  };

  handleTimeChange = (e, date, cb) => {
    this.setState({
      showEndTimePicker: false,
      showStartTimePicker: false,
    });
    if (e.type === "dismissed") return;
    cb(moment(date));
  };

  public render() {
    const {
      singleDay,
      startDate,
      endDate,
      updateStartDate,
      updateEndDate,
      validate,
      comment,
      updateComment,
      onFileDelete,
      files,
    } = this.props;
    const { showStartTimePicker, showEndTimePicker } = this.state;
    return (
      <PageContainer>
        <View style={style.container}>
          <View style={style.row}>
            <View style={style.switchContainer}>
              <View style={style.switchPartContainer}>
                <TouchableOpacity
                  style={[style.leftSwitch, style.switchPart, singleDay ? {} : style.clickable]}
                  onPress={this.onSingleDayPress}>
                  <Text>{I18n.t("viesco-single-day")}</Text>
                  <TextBold>{startDate.format("DD/MM")}</TextBold>
                </TouchableOpacity>
              </View>
              <View style={style.switchPartContainer}>
                <TouchableOpacity
                  style={[style.rightSwitch, style.switchPart, singleDay ? style.clickable : {}]}
                  onPress={this.onSeveralDaysPress}>
                  <View>
                    <Text>{I18n.t("viesco-several-days")}</Text>
                    {singleDay ? (
                      <TextBold>+</TextBold>
                    ) : (
                      <TextBold>
                        Du {startDate.format("DD/MM")} Au {endDate.format("DD/MM")}
                      </TextBold>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {singleDay || (
            <View style={style.row}>
              <DatePicker date={startDate} endDate={endDate} onGetDate={updateStartDate} />
              <DatePicker date={endDate} startDate={startDate} onGetDate={updateEndDate} />
            </View>
          )}
          {singleDay && (
            <View style={style.row}>
              <DatePicker date={startDate} startDate={moment()} onGetDate={updateStartDate} />
            </View>
          )}
          <View style={style.row}>
            <View style={style.column}>
              <TouchableOpacity style={style.timeContainer} onPress={this.onStartTimePress}>
                {singleDay || <Text style={{ marginBottom: 10 }}>{startDate.format("DD MMM")}</Text>}
                <Text style={style.fromToText}>{I18n.t("viesco-from-hour")}</Text>
                <TextBold style={{ margin: 10, textDecorationLine: "underline" }}>{startDate.format("HH:mm")}</TextBold>
              </TouchableOpacity>
            </View>
            <View style={style.column}>
              <TouchableOpacity style={style.timeContainer} onPress={this.onEndTimePress}>
                {singleDay || <Text style={{ marginBottom: 10 }}>{endDate.format("DD MMM")}</Text>}
                <Text style={style.fromToText}>{I18n.t("viesco-to-hour")}</Text>
                <TextBold style={{ margin: 10, textDecorationLine: "underline" }}>{endDate.format("HH:mm")}</TextBold>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[style.row]}>
            <View style={style.inputContainer}>
              <Text>{I18n.t("viesco-absence-motive")}</Text>
              <TextInput
                style={{ width: "100%" }}
                placeholder={I18n.t("viesco-enter-text")}
                value={comment}
                underlineColorAndroid="lightgrey"
                onChangeText={updateComment}
              />
              {/*<TouchableOpacity style={{ marginTop: 5 }} onPress={this.onDocumentPickerClick}>
                <Text>Pièces Justificatives</Text>
          </TouchableOpacity>*/}
            </View>
          </View>
          {/*files.map(f => {
            return (
              <View style={style.fileRow}>
                <Text> - {f.name}</Text>
                <TouchableOpacity onPress={() => onFileDelete(f)}>
                  <TextBold>X</TextBold>
                </TouchableOpacity>
              </View>
            );
          })*/}
          <View style={style.row}>
            <View style={style.column}>
              <DialogButtonOk label={I18n.t("viesco-validate")} onPress={validate} />
            </View>
          </View>
        </View>
        {showStartTimePicker && (
          <DateTimePicker
            value={startDate.toDate()}
            mode="time"
            display="spinner"
            onChange={(e, d) => {
              this.handleTimeChange(e, d, updateStartDate);
            }}
          />
        )}
        {showEndTimePicker && (
          <DateTimePicker
            value={endDate.toDate()}
            mode="time"
            display="spinner"
            onChange={(e, d) => {
              this.handleTimeChange(e, d, updateEndDate);
            }}
          />
        )}
      </PageContainer>
    );
  }
}

const style = StyleSheet.create({
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
  container: {
    paddingHorizontal: "5%",
  },
  switchPartContainer: {
    flexGrow: 1,
    flexBasis: 0,
  },
  timeContainer: {
    backgroundColor: "white",
    flexDirection: "column",
    alignItems: "center",
    padding: 30,
    width: "100%",
  },
  switchPart: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "lightgrey",
    padding: 15,
  },
  clickable: {
    backgroundColor: "white",
    elevation: 7,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
  },
  leftSwitch: {
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
  },
  rightSwitch: {
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
  },
  switchContainer: {
    justifyContent: "center",
    width: "100%",
    flexDirection: "row",
  },
  inputContainer: {
    backgroundColor: "white",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
    paddingVertical: 25,
    paddingHorizontal: 5,
  },
  fromToText: {
    textTransform: "uppercase",
    color: "#FCB602",
    borderStyle: "solid",
    borderBottomWidth: 2,
    borderColor: "#FCB602",
    paddingBottom: 7,
  },
  fileRow: {
    backgroundColor: "white",
    padding: 3,
    margin: 2,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
