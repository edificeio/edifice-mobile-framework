import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import { Icon } from "../../../../ui";
import { PageContainer } from "../../../../ui/ContainerContent";
import { HtmlContentView } from "../../../../ui/HtmlContentView";
import { Text, TextBold } from "../../../../ui/text";
import { LeftColoredItem } from "../../viesco/components/Item";

const style = StyleSheet.create({
  homeworkPart: { paddingVertical: 8, paddingHorizontal: 15 },
  title: { fontSize: 18 },
  subtitle: { color: "#AFAFAF", marginBottom: 15 },
  course: { fontWeight: "bold", textTransform: "uppercase" },
});

export default class DisplayHomework extends React.PureComponent<
  { getfunction: any; navigation: any },
  { homework: any }
> {
  constructor(props) {
    super(props);
    const homework = { ...this.props.navigation.state.params };
    this.state = {
      homework,
    };
  }

  public render() {
    const { homework } = this.state;
    const htmlOpts = {
      selectable: true,
    };
    return (
      <PageContainer>
        <ScrollView>
          <View style={{ justifyContent: "flex-end", flexDirection: "row" }}>
            <LeftColoredItem shadow style={{ alignItems: "flex-end", flexDirection: "row" }} color="#FA9700">
              {homework.description ? (
                <>
                  <Icon size={20} color="#FA9700" name="date_range" />
                  <Text>&emsp;{moment(homework.created_date).format("DD/MM/YY")}</Text>
                  <Text style={style.course}>&emsp;{homework.subject}</Text>
                </>
              ) : null}
            </LeftColoredItem>
          </View>

          <View style={[style.homeworkPart]}>
            <TextBold style={style.title}>{I18n.t("viesco-homework-home")}</TextBold>
            <Text style={style.subtitle}>
              {I18n.t("viesco-homework-fordate")} {moment(homework.due_date).format("Do MMMM YYYY")}
            </Text>
            {homework.description ? <HtmlContentView html={homework.description} opts={htmlOpts} /> : null}
          </View>
        </ScrollView>
      </PageContainer>
    );
  }
}
