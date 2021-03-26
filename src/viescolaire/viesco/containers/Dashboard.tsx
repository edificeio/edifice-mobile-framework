import I18n from "i18n-js";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";

import { getSessionInfo } from "../../../App";
import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import ConnectionTrackingBar from "../../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../../ui/ContainerContent";
import DashboardEmpty from "./DashboardEmpty";
import DashboardRelative from "./DashboardRelative";
import DashboardStudent from "./DashboardStudent";
import DashboardTeacher from "./DashboardTeacher";

export default class Dashboard extends React.PureComponent<{ navigation: { navigate } }, any> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<any> }) =>
    standardNavScreenOptions(
      {
        title: I18n.t("viesco"),
      },
      navigation
    );

  private getDashboardForType = userType => {
    switch (userType) {
      case "Teacher":
        return DashboardTeacher;
      case "Student":
        return DashboardStudent;
      case "Relative":
        return DashboardRelative;
      default:
        return DashboardEmpty;
    }
  };

  public render() {
    const DashboardContainer = this.getDashboardForType(getSessionInfo().type);

    return (
      <PageContainer>
        <ConnectionTrackingBar />
        <DashboardContainer {...this.props} />
      </PageContainer>
    );
  }
}
