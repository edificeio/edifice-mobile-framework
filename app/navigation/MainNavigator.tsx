import I18n from "i18n-js";
import * as React from "react";
import { connect } from "react-redux";

// import ConversationNavigator from "../conversation/ConversationNavigator";
import TimelineNavigator from "../timeline/TimelineNavigator";
import { RootNavigator } from "./RootNavigator";

import moduleDefinitions from "../AppModules";
import { getRoutesFromModuleDefinitions } from "../infra/moduleTool";
import {
  createMainTabNavigator,
  createMainTabNavOption
} from "./helpers/mainTabNavigator";

export const MainNavigator = getMainNavigator(["messagerie", "homeworks"]);

function getMainRoutes(apps: string[]) {
  const definitionsIntersection = moduleDefinitions.filter(mod => {
    return apps.includes(mod.config.apiName);
  });
  // return getRoutesFromModuleDefinitions(definitionsIntersection);
  return {
    // TODO put the routes of timeline & conversation in moduleDefinitions
    timeline: {
      screen: TimelineNavigator,

      navigationOptions: () =>
        createMainTabNavOption(I18n.t("News"), "nouveautes")
    },

    ...getRoutesFromModuleDefinitions(definitionsIntersection)
  };
}

function getMainNavigator(apps) {
  return createMainTabNavigator(getMainRoutes(apps));
}

class MainNavigatorHOC extends React.Component<{ apps: object }, {}> {
  public static router = RootNavigator.router;

  public shouldComponentUpdate(nextProps, nextState) {
    console.log(this.props.apps, nextProps.apps);
    return !compareArrays(this.props.apps, nextProps.apps);
  }

  public render() {
    console.log("render new navigator", Math.random());
    const { apps, ...forwardProps } = this.props;
    const Navigator = getMainNavigator(apps);
    return <Navigator {...forwardProps} />;
  }
}

const mapStateToProps = ({ user }) => ({
  apps: ["user", ...user.auth.apps]
});

export default connect(
  mapStateToProps,
  () => ({})
)(MainNavigatorHOC);

function compareArrays(array1, array2) {
  if (!array2) {
    return false;
  }
  if (array1.length !== array2.length) {
    return false;
  }
  for (let i = 0, l = array1.length; i < l; i++) {
    if (array1[i] instanceof Array && array2[i] instanceof Array) {
      if (!array1[i].compare(array2[i])) {
        return false;
      }
    } else if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}
