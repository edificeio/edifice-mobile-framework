import I18n from "i18n-js";
import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import withViewTracking from "../../../../framework/util/tracker/withViewTracking";
import { PageContainer } from "../../../../ui/ContainerContent";
import { EmptyScreen } from "../../../../ui/EmptyScreen";

class Dashboard extends React.PureComponent<any> {
  public render() {
    return (
      <PageContainer>
        <EmptyScreen
          imageSrc={require("~assets/images/empty-screen/empty-viesco.png")}
          imgWidth={265.98}
          imgHeight={279.97}
          title={I18n.t("viesco-empty-screen")}
        />
      </PageContainer>
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {};
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({}, dispatch);
};

export default withViewTracking("viesco")(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
