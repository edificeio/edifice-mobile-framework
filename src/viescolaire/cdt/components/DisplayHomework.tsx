import * as React from "react";
import { View, StyleSheet } from "react-native";
import moment from "moment";

import { Text, TextBold } from "../../../ui/text";
import { PageContainer } from "../../../ui/ContainerContent";
import { LeftColoredItem } from "../../viesco/components/Item";
import { Icon } from "../../../ui";
import { HtmlContentView } from "../../../ui/HtmlContentView";

const style = StyleSheet.create({
  homeworkPart: { paddingVertical: 8, paddingHorizontal: 15 },
  title: { fontSize: 18 },
  subtitle: { color: "#AFAFAF" },
  course: { fontWeight: "bold", textTransform: "uppercase" }
});

export default class DisplayHomework extends React.PureComponent<{getfunction:any}, {homeworkData:any}> {
  constructor(props) {
    super(props);
    this.state = {
      homeworkData: {}
    }

    this.datprops = this.datprops.bind(this);
    this.datprops();
  }
  
  datprops = async () => {
    let getHomeworkData = {};
    try {
      getHomeworkData = await this.props.getfunction;
      console.log("hm: ", getHomeworkData);
      this.setState({homeworkData: getHomeworkData});
    }
    catch(e) {
      console.log("caught error: ", e);
      this.setState({homeworkData: getHomeworkData});
    }
  }

  public render() {
    return (
      <PageContainer>
        <View style={{ justifyContent: "flex-end", flexDirection: "row" }}>
          <LeftColoredItem shadow style={{ alignItems: "flex-end", flexDirection: "row" }} color="#FA9700">
            { this.state.homeworkData.description ?
              <>
                <Icon size={20} color="orange" name="reservation" />
                <Text>&emsp;{moment(this.state.homeworkData.created).format("Do/MM/YY")}</Text>
                <Text style={style.course}>&emsp;Matière</Text>
              </>
              : null
            }
          </LeftColoredItem>
        </View>

        <View style={[style.homeworkPart]}>
          <TextBold style={style.title}>Travail à faire à la maison</TextBold>
          <Text style={style.subtitle}>Pour le {moment(this.state.homeworkData.due_date).format("Do MMMM YYYY")}</Text>
          { this.state.homeworkData.description ?
            <HtmlContentView html = {this.state.homeworkData.description} />
            : null
          }
        </View>
      </PageContainer>
    );
  };
}
