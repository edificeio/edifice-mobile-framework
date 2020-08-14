import * as React from "react";
import { View, StyleSheet } from "react-native";
import moment from "moment";
import I18n from "i18n-js";

import { Text, TextBold } from "../../../ui/text";
import { PageContainer } from "../../../ui/ContainerContent";
import { LeftColoredItem } from "../../viesco/components/Item";
import { Icon } from "../../../ui";
import { HtmlContentView } from "../../../ui/HtmlContentView";

const style = StyleSheet.create({
  sessionPart: { paddingVertical: 8, paddingHorizontal: 15 },
  pageTitle: { color: "#AFAFAF", textTransform: "uppercase" },
  title: { fontSize: 18 },
  subtitle: { color: "#AFAFAF", marginBottom: 15 },
  course: { fontWeight: "bold", textTransform: "uppercase" }
});

export default class DisplayHomework extends React.PureComponent<{getfunction:any, navigation:any}, {session:any}> {
  constructor(props) {
    super(props);
    const session = {...this.props.navigation.state.params}
    this.state = {
      session
    };
  }

  public render() {
    const { session } = this.state;
    return (
      <PageContainer>
        <View style={{ justifyContent: "flex-end", flexDirection: "row" }}>
          <LeftColoredItem shadow style={{ alignItems: "flex-end", flexDirection: "row" }} color="#00ab6f">
            <Icon size={20} color="#00ab6f" name="date_range" />
            <Text>&emsp;{moment(session.date).format("DD/MM/YY")}</Text>
            <Text style={style.course}>&emsp;{session.subject}</Text>
          </LeftColoredItem>
        </View>

        <View style={[style.sessionPart]}>
          <Text style={ style.pageTitle }>{I18n.t("viesco-session")}</Text>
          <TextBold style={style.title}>{session.title}</TextBold>
          { session.description ?
            <HtmlContentView html = {session.description} />
            : null
          }
        </View>
      </PageContainer>
    );
  };
}
