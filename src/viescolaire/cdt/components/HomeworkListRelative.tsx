import * as React from "react";
import { View, StyleSheet, Switch, TouchableOpacity, Platform } from "react-native";
import moment from "moment";
import I18n from "i18n-js";

import { Text, TextBold } from "../../../ui/text";
import { PageContainer } from "../../../ui/ContainerContent";
import { Icon } from "../../../ui";
import { getHomeworkListState } from "../state/homeworks";
import { HomeworkItem } from "./homework";
import { SessionItem } from "./session";
import { EmptyScreen } from "../../../ui/EmptyScreen";
import { DatePicker } from "../../../ui/DatePicker";

const style = StyleSheet.create({
  homeworkPart: { paddingVertical: 8, paddingHorizontal: 15 },
  title: { fontSize: 18 },
  subtitle: { color: "#AFAFAF" },
  course: { fontWeight: "bold", textTransform: "uppercase" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default class HomeworkList extends React.PureComponent<{getfunction:any}, any> {
  constructor(props) {
    super(props);
    this.state = {
      homeworkDataList: [],
      switchValue: false,
    }

    this.datprops = this.datprops.bind(this);
    this.datprops();
  }
  
  datprops = async () => {
    let getHomeworkDataList = [];
    try {
      getHomeworkDataList = await this.props.getfunction;
      this.setState({homeworkDataList: getHomeworkDataList});
    }
    catch(e) {
      this.setState({homeworkDataList: getHomeworkDataList});
    }
  }

  private homeworkToDo() {
    return (
      <>
        { this.state.homeworkDataList != undefined && this.state.homeworkDataList.length > 0 ?
          <View>
            { this.state.homeworkDataList.map((course, index, list) => (
              <TouchableOpacity onPress={() => this.props.navigation.navigate("HomeworkPage")}>
                { index === 0 || course.due_date.substring(0, 10) != list[index -1].due_date.substring(0, 10) ?
                  <TextBold>{I18n.t("viesco-homework-fordate")} {moment(course.due_date).format("dddd Do MMMM")}</TextBold>
                  : null
                }
                <HomeworkItem disabled checked={true} title={course.subject_id} subtitle={course.type.label} />
                
              </TouchableOpacity>
            ))}
          </View>
          :
          <EmptyScreen
            imageSrc={require("../../../../assets/images/empty-screen/empty-homework.png")}
            imgWidth={265}
            imgHeight={280}
            title={I18n.t("viesco-homework-EmptyScreenText")}
          />
        }
      </>
    );
  }

  private sessionToDo() {
    return (
      <>
        { this.state.homeworkDataList != undefined && this.state.homeworkDataList.length > 0 ?
          <View>
            { this.state.homeworkDataList.map((session, index, list) => (
              <TouchableOpacity onPress={() => this.props.navigation.navigate("SessionPage")}>
                { index === 0 || session.date.substring(0, 10) != list[index -1].date.substring(0, 10) ?
                  <TextBold>{moment(session.date).format("DD/MM/YY")}</TextBold>
                  : null
                }
                <SessionItem matiere={session.subject_id} author={session.teacher_id} />
              </TouchableOpacity>
            ))}
          </View>
          :
          <EmptyScreen
            imageSrc={require("../../../../assets/images/empty-screen/empty-evaluations.png")}
            imgWidth={265}
            imgHeight={280}
            title={I18n.t("viesco-session-EmptyScreenText")}
          />
        }
      </>
    );
  }

  private toggleSwitch = (value) => {
    this.setState({ switchValue: value });
  }

  public render() {
    return (
      <PageContainer style={style.homeworkPart}>
        <View style={ style.grid }>
          <Text>Du &ensp;</Text><DatePicker onGetDate={(dateStart) => console.log("dateStart: ", dateStart)} />
          <Text>&emsp;Au &ensp;</Text><DatePicker onGetDate={(dateEnd) => console.log("dateEnd: ", dateEnd)} />
        </View>
        <View style={ style.grid }>
          <Text>{I18n.t("viesco-homework")}</Text>
          <Switch
            style={{ marginTop: 30 }}
            trackColor={{ false: "#FA9700", true: "#2BAB6F"}}
            onValueChange={this.toggleSwitch}
            value={this.state.switchValue}
          />
          <Text>{I18n.t("viesco-session")}</Text>
        </View>
        { !this.state.switchValue ? this.homeworkToDo() : <Text>TOTO</Text> }
      </PageContainer>
    );
  };
}
