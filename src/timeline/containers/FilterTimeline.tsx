import * as React from "react";
import I18n from "i18n-js";
import { connect } from "react-redux";
import { pickFilters, setFilters } from "../actions/pickFilter";
import { PageContainer, ListItem } from "../../ui/ContainerContent";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { Heavy } from "../../ui/Typography";
import { Checkbox } from "../../ui/forms/Checkbox";
import Tracking from "../../tracking/TrackingManager";
import { NavigationScreenProp, NavigationState, NavigationParams } from "react-navigation";
import { alternativeNavScreenOptions } from "../../navigation/helpers/navHelper";
import { HeaderAction } from "../../ui/headers/NewHeader";
import { Dispatch } from "redux";

export interface FilterTimelineProps {
  selectedApps: string[];
  availableApps: string[];
  legalApps: string[];
  pickFilters: (selectedApps: string[]) => void;
  setFilters: (apps: string[], legalApps: string[]) => void;
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

// tslint:disable-next-line:max-classes-per-file
export class FilterTimeline extends React.Component<FilterTimelineProps> {

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) =>
    alternativeNavScreenOptions(
      {
        title: I18n.t("timeline-filterBy"),
        headerLeft: <HeaderAction
          onPress={() => {
            navigation.getParam("onCancel")();
          }}
          name="close"
        />,
        headerRight: <HeaderAction
          onPress={() => {
            navigation.getParam("onApply")();
          }}
          title={I18n.t("apply")}
        />,
      },
      navigation
    );

  constructor(props: FilterTimelineProps) {
    super(props);
    // Header events setup
    this.props.navigation.setParams({
      onApply: () => {
        this.props.setFilters(this.props.selectedApps, this.props.legalApps);
        Tracking.logEvent("filterTimeline", {
          filterBy: JSON.stringify(this.props.selectedApps)
        });
        this.props.navigation.goBack();
      },
      onCancel: () => {
        this.props.pickFilters(this.props.availableApps);
        this.props.navigation.goBack();
      }
    });
  }

  checkApp(app: any, val: any) {
    const newSelectedApps = { ...this.props.selectedApps };
    newSelectedApps[app.name] = val;
    this.props.pickFilters(newSelectedApps);
  }

  checkAllApps(val: boolean) {
    let newApps = {};
    for (let prop in this.props.selectedApps) {
      newApps[prop] = val;
    }
    this.props.pickFilters(newApps);
  }

  get allAppsChecked(): boolean {
    let allChecked = true;
    for (let app in this.props.selectedApps) {
      allChecked = allChecked && this.props.selectedApps[app];
    }
    return allChecked;
  }

  render() {
    let apps = [];
    for (let app in this.props.selectedApps) {
      apps.push({
        name: app,
        checked: this.props.selectedApps[app]
      });
    }

    return (
      <PageContainer>
        <ConnectionTrackingBar />
        <ListItem
          style={{ justifyContent: "space-between" }}
          onPress={() => this.checkAllApps(!this.allAppsChecked)}
        >
          <Heavy>{I18n.t(`timeline-allFilter`)}</Heavy>
          <Checkbox
            checked={this.allAppsChecked}
            onCheck={() => this.checkAllApps(true)}
            onUncheck={() => this.checkAllApps(false)}
          />
        </ListItem>
        {apps.map(app => (
          <ListItem
            key={app.name}
            style={{ justifyContent: "space-between" }}
            onPress={() => this.checkApp(app, !app.checked)}
          >
            <Heavy>{I18n.t(`timeline-${app.name.toLowerCase()}Filter`)}</Heavy>
            <Checkbox
              checked={app.checked}
              onCheck={() => this.checkApp(app, true)}
              onUncheck={() => this.checkApp(app, false)}
            />
          </ListItem>
        ))}
      </PageContainer>
    );
  }
}

export const FilterTimelineConnect = connect(
  (state: any) => ({
    selectedApps: state.timeline.selectedApps,
    availableApps: state.timeline.availableApps,
    legalApps: state.user.auth.apps
  }),
  (dispatch: Dispatch) => ({
    pickFilters: (apps: string[]) => pickFilters(dispatch)(apps),
    setFilters: (apps: string[], legalapps: string[]) => setFilters(dispatch)(apps, legalapps)
  })
)(FilterTimeline);
