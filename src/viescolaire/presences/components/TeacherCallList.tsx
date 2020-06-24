import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, Image } from "react-native";

import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import { Text } from "../../../ui/text";
import { BottomColoredItem } from "../../viesco/components/Item";

const style = StyleSheet.create({
  dashboardPart: { paddingVertical: 8, paddingHorizontal: 15 },
});

const CoursesCallSheet = ({ color, text, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <BottomColoredItem shadow style={{ alignItems: "flex-start", flexDirection: "column" }} color={color}>
        <Text>
          {text.start_hour} - {text.end_hour}
        </Text>
        <Text>{text.grade}</Text>
        <Text>{text.classroom}</Text>
        <Image
          source={require("../../../../assets/viesco/presences.png")}
          style={{ height: 90, width: 90, alignSelf: "flex-end" }}
          resizeMode="contain"
        />
      </BottomColoredItem>
    </TouchableOpacity>
  );
};

export default class CallList extends React.PureComponent<any, any> {
  constructor(props) {
    super(props);

    const { courses } = props;
    this.state = {
      coursesDataList: courses.data,
      fetching: courses.isFetching,
      teacherId: "95eb76f0-273f-4a55-95e4-8739c06fdfff",
      structureId: "97a7363c-c000-429e-9c8c-d987b2a2c204",
      startDate: moment().format("YYYY-MM-DD"),
      endDate: moment().format("YYYY-MM-DD"),
    };
  }

  componentDidMount() {
    this.props.fetchCourses(this.state.teacherId, this.state.structureId, this.state.startDate, this.state.endDate);
  }

  componentDidUpdate() {
    const { courses } = this.props;
    const fetching = courses.isFetching;
    this.setState({
      coursesDataList: courses.data,
      fetching,
    });
  }

  private displayCoursesCalls() {
    return (
      <View>
        <Text>{I18n.t("viesco-register-date")} {moment().format("DD MMMM YYYY")}</Text>
        <CoursesCallSheet
          onPress={() => this.props.navigation.navigate("CallSheetPage")}
          text={{
            start_hour: moment(this.state.coursesDataList[0].startDate).format("hh:mm"),
            end_hour: moment(this.state.coursesDataList[0].endDate).format("hh:mm"),
            grade: this.state.coursesDataList[0].classes,
            classroom: this.state.coursesDataList[0].roomLabels,
          }}
          color="#FFB600"
        />
      </View>
    );
  }

  public render() {
    return (
      <View style={style.dashboardPart}>
        {this.state.coursesDataList[0] !== undefined ? this.displayCoursesCalls() : null}
      </View>
    );
  }
}
