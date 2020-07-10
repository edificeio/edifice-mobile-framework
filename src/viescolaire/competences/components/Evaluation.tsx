import I18n from "i18n-js";
import * as React from "react";
import { View, StyleSheet } from "react-native";

import { PageContainer } from "../../../ui/ContainerContent";
import { Text, TextBold } from "../../../ui/text";
import ChildPicker from "../../viesco/containers/ChildPicker";
import { GradesDevoirs } from "./Item";

export default class Competences extends React.PureComponent<any, any> {
  constructor(props) {
    super(props);

    const { devoirsList } = this.props;
    this.state = {
      devoirs: devoirsList.data,
      fetching: devoirsList.isFetching,
    };
  }

  componentDidMount() {
    this.props.getDevoirs();
  }

  componentDidUpdate() {
    const { devoirsList } = this.props;
    const fetching = devoirsList.isFetching;
    this.setState({
      devoirs: devoirsList.data,
      fetching,
    });
  }

  public render() {
    return (
      <PageContainer>
        <ChildPicker hideButton />
        <View style={style.dashboardPart}>
          <View style={style.dashboardPart}>
            <Text style={style.subtitle}>{I18n.t("viesco-report-card")}</Text>
          </View>
          <TextBold style={{ marginBottom: 10 }}>{I18n.t("viesco-last-grades")}</TextBold>
          {this.state.devoirs !== undefined && this.state.devoirs.length > 0 ? (
            <View>
              <GradesDevoirs devoirs={this.state.devoirs} />
            </View>
          ) : null}
        </View>
      </PageContainer>
    );
  }
}

const style = StyleSheet.create({
  subtitle: { color: "#AFAFAF" },
  dashboardPart: { paddingVertical: 8, paddingHorizontal: 15 },
});
