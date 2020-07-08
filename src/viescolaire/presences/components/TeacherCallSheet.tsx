import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";

import ButtonOk from "../../../ui/ConfirmDialog/buttonOk";
import ConnectionTrackingBar from "../../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../../ui/ContainerContent";
import { Text, TextBold } from "../../../ui/Typography";
import { Icon } from "../../../ui/icons/Icon";
import { LeftColoredItem } from "../../viesco/components/Item";
import StudentRow from "./StudentRow";

const style = StyleSheet.create({
  scrollView: { flex: 1, minHeight: 300, paddingBottom: 125 },
  validateButton: {
    alignSelf: "center",
    width: "40%",
    margin: 20,
  },
  classesView: { justifyContent: "flex-end", flexDirection: "row", paddingBottom: 15 },
  topItem: { justifyContent: "flex-end", flexDirection: "row" },
});

export default class CallSheet extends React.PureComponent<any, any> {
  constructor(props) {
    super(props);

    const { callList } = props;
    this.state = {
      refreshing: false,
      callData: callList.data,
      fetching: callList.isFetching,
      isScrolling: false,
    };
  }

  componentDidMount() {
    const { registerId } = this.props.navigation.state.params;
    this.props.getClasses(registerId);
  }

  componentDidUpdate() {
    const { callList } = this.props;
    const fetching = callList.isFetching;
    this.setState({
      callData: callList.data,
      fetching,
      refreshing: fetching,
    });
  }

  onRefreshStudentsList = () => {
    this.setState({ refreshing: true });
    const { registerId } = this.props.navigation.state.params;
    this.props.getClasses(registerId);
  };

  private StudentsList() {
    const { students } = this.state.callData;
    const studentsList = students.sort((a, b) => a.name.localeCompare(b.name));
    const { registerId } = this.props.navigation.state.params;
    const { postAbsentEvent, deleteEvent, navigation } = this.props;
    return (
      <>
        {studentsList.length > 0 ? (
          <ScrollView
            contentContainerStyle={style.scrollView}
            refreshControl={
              <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefreshStudentsList} />
            }>
            {studentsList.map(student => (
              <StudentRow
                student={student}
                lateCallback={event =>
                  this.props.navigation.navigate("DeclareEvent", {
                    type: "late",
                    registerId,
                    student,
                    startDate: "2020-07-01T10:40:00.000",
                    endDate: "2020-07-01T11:35:00.000",
                    event,
                  })
                }
                leavingCallback={event =>
                  this.props.navigation.navigate("DeclareEvent", {
                    type: "leaving",
                    registerId,
                    student,
                    startDate: "2020-07-01T10:40:00.000",
                    endDate: "2020-07-01T11:35:00.000",
                    event,
                  })
                }
                checkAbsent={() => {
                  postAbsentEvent(
                    student.id,
                    registerId,
                    moment("2020-07-01T10:40:00.000"),
                    moment("2020-07-01T11:35:00.000")
                  );
                }}
                uncheckAbsent={event => {
                  deleteEvent(event);
                }}
              />
            ))}
            <View style={style.validateButton}>
              <ButtonOk
                label={I18n.t("viesco-validate")}
                onPress={() => {
                  this.props.validateRegister(registerId);
                  navigation.goBack(null);
                }}
              />
            </View>
          </ScrollView>
        ) : null}
      </>
    );
  }

  private ClassesInfos() {
    return (
      <View style={style.classesView}>
        <LeftColoredItem shadow style={style.topItem} color="#FFB600">
          <Text>
            {moment(this.state.callData.start_date).format("hh:mm")} -{" "}
            {moment(this.state.callData.end_date).format("hh:mm")}
          </Text>
          <Text>
            &emsp;
            <Icon name="pin_drop" size={18} />
            Salle 302
          </Text>
          <TextBold>&emsp;6ème6</TextBold>
        </LeftColoredItem>
      </View>
    );
  }

  renderCall = () => {
    return (
      <View>
        {this.ClassesInfos()}
        {this.StudentsList()}
      </View>
    );
  };

  public render() {
    return (
      <PageContainer>
        <ConnectionTrackingBar />
        {this.state.callData.course_id !== undefined ? this.renderCall() : null}
      </PageContainer>
    );
  }
}
