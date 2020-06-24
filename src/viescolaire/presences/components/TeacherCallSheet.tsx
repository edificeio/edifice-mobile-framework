import moment from "moment";
import * as React from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";

import ConnectionTrackingBar from "../../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../../ui/ContainerContent";
import { Text, TextBold } from "../../../ui/text";
import { LeftColoredItem } from "../../viesco/components/Item";

const style = StyleSheet.create({
  scrollView: { flex: 1, minHeight: 300 },
  studentsList: {
    justifyContent: "flex-start",
    flexDirection: "row",
    height: 60,
    borderRadius: 5,
    elevation: 2,
    padding: 10,
  },
});

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

export default class CallSheet extends React.PureComponent<any, any> {
  constructor(props) {
    super(props);

    const { callList } = props;
    this.state = {
      refreshing: false,
      callData: callList.data,
      fetching: callList.isFetching,
    };
  }

  componentDidMount() {
    this.props.fetchClassesCall("16307");
  }

  componentDidUpdate() {
    const { callList } = this.props;
    const fetching = callList.isFetching;
    this.setState({
      callData: callList.data,
      fetching,
    });
  }

  onRefreshStudentsList = () => {
    this.setState({ refreshing: true });
    this.props.fetchClassesCall("16307");

    wait(2000).then(() => this.setState({ refreshing: false }));
  }

  private StudentsList() {
    return (
      <>
        {this.state.callData.students.length > 0 ? (
          <ScrollView
            contentContainerStyle={style.scrollView}
            refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefreshStudentsList} />}>
            {this.state.callData.students.map((student, index, list) => (
              <View style={style.studentsList}>
                <Text>{student.name}</Text>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </>
    );
  }

  private ClassesInfos() {
    return (
      <View style={{ justifyContent: "flex-end", flexDirection: "row", paddingBottom: 15 }}>
        <LeftColoredItem shadow style={{ justifyContent: "flex-end", flexDirection: "row" }} color="#FFB600">
          <Text>
            {moment(this.state.callData.start_date).format("hh:mm")} - {moment(this.state.callData.end_date).format("hh:mm")}
          </Text>
          <Text>&emsp;Salle 302</Text>
          <TextBold style={{ fontSize: 20 }}>&emsp;6ème6</TextBold>
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
  }

  public render() {
    return (
      <PageContainer>
        <ConnectionTrackingBar />
        {this.state.callData.course_id !== undefined ? this.renderCall() : null}
      </PageContainer>
    );
  }
}
