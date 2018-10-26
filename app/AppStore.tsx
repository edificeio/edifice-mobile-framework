import * as React from "react";
import I18n, { getLanguages } from "react-native-i18n";
import { Provider } from "react-redux";
import { applyMiddleware, combineReducers, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import AppScreen from "./AppScreen";

// import conversation from "./conversation/reducer"; // old conversation module
import connectionTracker from "./infra/reducers/connectionTracker";
import ui from "./infra/reducers/ui";
import timeline from "./timeline/reducer";

import { login } from "./user/actions/login";

import moduleDefinitions from "./AppModules";
import { getReducersFromModuleDefinitions } from "./infra/moduleTool";

const reducers = {
  connectionTracker,
  ui,
  ...getReducersFromModuleDefinitions(moduleDefinitions)
};

const rootReducer = combineReducers({
  ...reducers,
  // conversation, // TODO definitely remove this module
  timeline // TODO put this un module definitions
});

const enhancer = applyMiddleware(thunkMiddleware);
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
    store.dispatch(login(true) as any);
  }

  public render() {
    return (
      <Provider store={store}>
        <AppScreen />
      </Provider>
    );
  }
}
