import * as React from "react";
import { View } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { IResourceUriNotification } from "../reducer/notifications";
import { Text } from "../../../components/text";
import withViewTracking from "../../../tracker/withViewTracking";
import { INotifFilterSettings } from "../reducer/notifSettings/notifFilterSettings";

// TYPES ==========================================================================================

export interface IFiltersScreenDataProps { };
export interface IFiltersScreenEventProps { };
export type IFiltersScreenProps = IFiltersScreenDataProps & IFiltersScreenEventProps & NavigationInjectedProps;

export interface IFiltersScreenState { };

// COMPONENT ======================================================================================

export class FiltersScreen extends React.PureComponent<
  IFiltersScreenProps,
  IFiltersScreenState
  > {

  // DECLARATIONS =================================================================================

  // RENDER =======================================================================================

  render() {
    return <View>
      
    </View>;
  }

  renderList() {

  }

  renderListItem(item: INotifFilterSettings) {
    
  }

  // LIFECYCLE ====================================================================================

  // METHODS ======================================================================================
}

// UTILS ==========================================================================================

// MAPPING ========================================================================================

const FiltersScreen_Connected = connect(() => ({}), () => ({}))(FiltersScreen);
export default withViewTracking("timeline/filters")(FiltersScreen_Connected);
