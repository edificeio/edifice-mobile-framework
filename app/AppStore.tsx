import * as React from "react";
import I18n, { getLanguages } from "react-native-i18n";
import { Provider } from "react-redux";
import { applyMiddleware, combineReducers, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import AppScreen from "./AppScreen";
import { middleware } from "./navigation/middleware";

import auth from "./auth/reducer";
import conversation from "./conversation/reducer";
import connectionTracker from "./infra/reducers/connectionTracker";
import timeline from "./timeline/reducer";

import moduleDefinitions from "./AppModules";
import { getReducersFromModuleDefinitions } from "./infra/moduleTool";

const reducers = {
  auth,
  connectionTracker,
  ...getReducersFromModuleDefinitions(moduleDefinitions)
};

const rootReducer = combineReducers({
  ...reducers,
  conversation, // TODO put this un module definitions
  timeline
});

const enhancer = applyMiddleware(middleware, thunkMiddleware);
const store = createStore(rootReducer, enhancer);

I18n.fallbacks = true;
I18n.translations = {
  en: require("../assets/i18n/en"),
  es: require("../assets/i18n/es"),
  fr: require("../assets/i18n/fr")
};
I18n.defaultLocale = "en";

getLanguages();

export class AppStore extends React.Component {
  public componentDidMount() {
    store.dispatch({ type: "CHECK_LOGIN_AUTH" });
  }

  public render() {
    return (
      <Provider store={store}>
        <AppScreen />
      </Provider>
    );
  }
}
