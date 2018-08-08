import I18n from "react-native-i18n";
import { tabRootOptions } from "../utils/navHelper";
import homeworkConfig from "./config";

import mainComp from "./navigator";

// Main component
export default mainComp;

// Route
export const route = {
  [homeworkConfig.name]: {
    screen: mainComp,

    navigationOptions: () =>
      tabRootOptions(
        I18n.t(homeworkConfig.displayName),
        homeworkConfig.iconName
      )
  }
};
