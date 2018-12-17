import I18n from "i18n-js";
import * as React from "react";
import RNLanguages from "react-native-languages";
import { Provider } from "react-redux";
import { applyMiddleware, combineReducers, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import AppScreen from "./AppScreen";

import Tracking from "./tracking/TrackingManager";

import connectionTracker from "./infra/reducers/connectionTracker";
import ui from "./infra/reducers/ui";
import timeline from "./timeline/reducer";

import { login } from "./user/actions/login";

import moduleDefinitions from "./AppModules";
import { getReducersFromModuleDefinitions } from "./infra/moduleTool";
import { AppState } from "react-native";

const reducers = {
  connectionTracker,
  ui,
  ...getReducersFromModuleDefinitions(moduleDefinitions)
};

const rootReducer = combineReducers({
  ...reducers,
  timeline // TODO put this in module definitions
});

const enhancer = applyMiddleware(thunkMiddleware);
const store = createStore(rootReducer, enhancer);

// Translation setup
I18n.fallbacks = true;
I18n.defaultLocale = "en";
I18n.translations = {
  en: require("../assets/i18n/en"),
  es: require("../assets/i18n/es"),
  fr: require("../assets/i18n/fr")
};
// Print current device language
console.log("language", RNLanguages.language);
// Print user preferred languages (in order)
console.log("languages", RNLanguages.languages);
I18n.locale = RNLanguages.language;

export class AppStore extends React.Component {
  public async componentDidMount() {
    AppStore.notifAlreadyRouted = false;
    store.dispatch(login(true) as any);
  }

  public static notifAlreadyRouted = false;

  public render() {
    return (
      <Provider store={store}>
        <AppScreen />
      </Provider>
    );
  }

  // Translation locale change setup
  public async componentWillMount() {
    await Tracking.init();
    RNLanguages.addEventListener("change", this.onLanguagesChange);
    AppState.addEventListener("change", this._handleAppStateChange);
  }

  public componentWillUnmount() {
    RNLanguages.removeEventListener("change", this.onLanguagesChange);
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  private onLanguagesChange = ({ language }) => {
    I18n.locale = language;
  };

  private _handleAppStateChange = nextAppState => {
    if (nextAppState === "active") {
      AppStore.notifAlreadyRouted = false;
    }
    this.setState({ appState: nextAppState });
  };
}
