import * as React from "react";
import { View } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import withViewTracking from "../../../tracker/withViewTracking";
import { INotifFilterSettings } from "../reducer/notifSettings/notifFilterSettings";

// TYPES ==========================================================================================

export interface ITimelineFiltersScreenDataProps { };
export interface ITimelineFiltersScreenEventProps { };
export type ITimelineFiltersScreenProps = ITimelineFiltersScreenDataProps & ITimelineFiltersScreenEventProps & NavigationInjectedProps;

export interface ITimelineFiltersScreenState { };

// COMPONENT ======================================================================================

export class TimelineFiltersScreen extends React.PureComponent<
  ITimelineFiltersScreenProps,
  ITimelineFiltersScreenState
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

const TimelineFiltersScreen_Connected = connect(() => ({}), () => ({}))(TimelineFiltersScreen);
export default withViewTracking("timeline/filters")(TimelineFiltersScreen_Connected);
