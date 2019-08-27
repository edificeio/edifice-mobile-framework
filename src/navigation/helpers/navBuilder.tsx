import moduleDefinitions from "../../AppModules";

import { CommonStyles } from "../../styles/common/styles";
import { getRoutesFromModuleDefinitions, IAppModule } from "../../infra/moduleTool";

export const getRoutes = (modules: IAppModule[]) => {
  return getRoutesFromModuleDefinitions(modules);
};

export const getModules: (filter: (module: IAppModule) => boolean) => IAppModule[] = filter => {
  return moduleDefinitions.filter(filter);
};

export const standardNavScreenOptions = (props, { state }) => {
  const { params = {} } = state;
  const { header } = params;

  return {
    header,
    headerTintColor: "white",
    tabBarVisible: header !== null,
    headerBackTitle: null,
    ...props,
    headerStyle: {
      backgroundColor: CommonStyles.mainColorTheme,
      elevation: 5,
      height: 56,
      ...(props.headerStyle || {}),
    },
    headerTitleStyle: {
      alignSelf: "center",
      color: "white",
      fontFamily: CommonStyles.primaryFontFamily,
      fontSize: 16,
      fontWeight: "400",
      textAlign: "center",
      flex: 1,
      ...(props.headerTitleStyle || {}),
    },
  };
};
