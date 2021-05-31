import I18n from "i18n-js";
import * as React from "react";
import { FlatList, Text } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { IGlobalState } from "../../../../AppStore";
import { PageContainer } from "../../../../ui/ContainerContent";
import { Checkbox } from "../../../components/checkbox";
import { FakeHeader, HeaderAction, HeaderRow, HeaderTitle } from "../../../components/header";
import { ListItem } from "../../../components/listItem";
import theme from "../../../theme";

import withViewTracking from "../../../tracker/withViewTracking";
import { setFiltersAction } from "../actions/notifSettings";
import moduleConfig from "../moduleConfig";
import { ITimeline_State } from "../reducer";
import { INotificationFilter } from "../reducer/notifDefinitions/notifFilters";
import { INotifFilterSettings } from "../reducer/notifSettings/notifFilterSettings";

// TYPES ==========================================================================================

export interface ITimelineFiltersScreenDataProps {
  notifFilterSettings: INotifFilterSettings;
  notifFilters: INotificationFilter[];
};
export interface ITimelineFiltersScreenEventProps {
  handleSetFilters(selectedFilters: INotifFilterSettings): Promise<void>;
};
export type ITimelineFiltersScreenProps = ITimelineFiltersScreenDataProps & ITimelineFiltersScreenEventProps & NavigationInjectedProps;

export interface ITimelineFiltersScreenState { 
  selectedFilters: INotifFilterSettings
};

// COMPONENT ======================================================================================

export class TimelineFiltersScreen extends React.PureComponent<
  ITimelineFiltersScreenProps,
  ITimelineFiltersScreenState
  > {

  // DECLARATIONS =================================================================================

  static navigationOptions = {
    header: () => null, // Header is included in screen
  }

  state: ITimelineFiltersScreenState = {
    selectedFilters: { ...this.props.notifFilterSettings }
  }

  // RENDER =======================================================================================

  render() {
    return (
      <>
        {this.renderHeader()}
        <PageContainer>
          {this.renderList()}
        </PageContainer>
      </>
    );
  }

  renderHeader() {
    const { navigation } = this.props;
    const { selectedFilters } = this.state;
    const noneSet = !Object.values(selectedFilters).find(value => value);
    return (
      <FakeHeader>
        <HeaderRow>
          <HeaderAction iconName="back" onPress={() => navigation.goBack()}/>
          <HeaderTitle>{I18n.t("timeline.filtersScreen.title")}</HeaderTitle>
          <HeaderAction
            text={I18n.t("timeline.filtersScreen.apply")}
            disabled={noneSet}
            onPress={() => this.doSetFilters(selectedFilters)}
          />
        </HeaderRow>
      </FakeHeader>
    );
  }

  renderList() {
    const { notifFilters } = this.props;
    const { selectedFilters } = this.state;
    const someNotSet = Object.values(selectedFilters).some(value => !value);
    return (
      <FlatList
        // data
        data={notifFilters}
        ListHeaderComponent={notifFilters.length < 2
          ? null
          : <ListItem
              leftElement={
                <Text style={{color: theme.color.text.heavy}}>
                  {I18n.t("timeline.filtersScreen.all")}
                </Text>
              }
              rightElement={
                <Checkbox
                  customCheckboxColor={!someNotSet ? theme.color.checkboxBorder : undefined}
                  customContainerStyle={{backgroundColor: theme.color.cardBackground, borderColor: theme.color.checkboxBorder, borderWidth: 2}}
                  checked={!someNotSet}
                  onPress={() => {
                    let updatedSelectedFilters = selectedFilters;
                    const selectedFiltersKeys = Object.keys(selectedFilters);
                    selectedFiltersKeys.forEach(element => updatedSelectedFilters[element] = someNotSet);
                    this.setState({selectedFilters: {...updatedSelectedFilters}});
                  }}
                />
              }
            />
        }
        renderItem={({ item }) => this.renderFilterItem(item)}
      />
    );
  }

  renderFilterItem(item: INotificationFilter) {
    const { selectedFilters } = this.state
    return (
      <ListItem
        leftElement={
          <Text style={{color: theme.color.text.heavy}}>
            {I18n.t(item.i18n)}
          </Text>
        }
        rightElement={
          <Checkbox
            checked={selectedFilters[item.type]}
            onPress={() => this.setState({
              selectedFilters: {...selectedFilters, [item.type]: !selectedFilters[item.type]}
            })}
          />
        }
      />
    );
  }

  // LIFECYCLE ====================================================================================

  // METHODS ======================================================================================

  async doSetFilters(selectedFilters: INotifFilterSettings) {
    const { handleSetFilters, navigation } = this.props;
    await handleSetFilters(selectedFilters);
    navigation.navigate("timeline", {reloadWithNewSettings: true});
  }

}

// UTILS ==========================================================================================

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => ITimelineFiltersScreenDataProps = (s) => {
  let ts = moduleConfig.getState(s) as ITimeline_State;
  return {
    notifFilterSettings: ts.notifSettings.notifFilterSettings.data,
    notifFilters: ts.notifDefinitions.notifFilters.sort((a,b) => I18n.t(a.i18n).localeCompare(I18n.t(b.i18n), I18n.locale))
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => ITimelineFiltersScreenEventProps
  = (dispatch, getState) => ({
    handleSetFilters: async (selectedFilters: INotifFilterSettings) => { await dispatch(setFiltersAction(selectedFilters)); }
  })

const TimelineFiltersScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(TimelineFiltersScreen);
export default withViewTracking("timeline/filters")(TimelineFiltersScreen_Connected);
