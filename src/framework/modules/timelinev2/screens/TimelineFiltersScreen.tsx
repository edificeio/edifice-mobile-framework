import { NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { Checkbox } from '~/framework/components/checkbox';
import FlatList from '~/framework/components/flatList';
import { ListItem } from '~/framework/components/listItem';
import { PageView } from '~/framework/components/page';
import { SmallText } from '~/framework/components/text';
import { setFiltersAction } from '~/framework/modules/timelinev2/actions/notifSettings';
import moduleConfig from '~/framework/modules/timelinev2/moduleConfig';
import { ITimeline_State } from '~/framework/modules/timelinev2/reducer';
import { INotificationFilter } from '~/framework/modules/timelinev2/reducer/notifDefinitions/notifFilters';
import { INotifFilterSettings } from '~/framework/modules/timelinev2/reducer/notifSettings/notifFilterSettings';
import { NavBarAction } from '~/framework/navigation/navBar';
import { shallowEqual } from '~/framework/util/object';

import { ITimelineNavigationParams } from '../navigation';

// TYPES ==========================================================================================

export interface ITimelineFiltersScreenDataProps {
  notifFilterSettings: INotifFilterSettings;
  notifFilters: INotificationFilter[];
}
export interface ITimelineFiltersScreenEventProps {
  handleSetFilters(selectedFilters: INotifFilterSettings): Promise<void>;
}
export type ITimelineFiltersScreenProps = ITimelineFiltersScreenDataProps &
  ITimelineFiltersScreenEventProps &
  NativeStackScreenProps<ITimelineNavigationParams, 'Filters'>;

export interface ITimelineFiltersScreenState {
  selectedFilters: INotifFilterSettings;
}

// STYLES =======================================================================================

const styles = StyleSheet.create({
  checkboxContainer: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.text.light,
    borderWidth: 2,
  },
});

// NAVBAR =========================================================================================

export function computeNavBar(disabled: boolean, onPress?: () => void) {
  return <NavBarAction title={I18n.t('common.apply')} disabled={disabled} onPress={onPress} />;
}

// COMPONENT ======================================================================================

export class TimelineFiltersScreen extends React.PureComponent<ITimelineFiltersScreenProps, ITimelineFiltersScreenState> {
  // DECLARATIONS =================================================================================

  state: ITimelineFiltersScreenState = {
    selectedFilters: { ...this.props.notifFilterSettings },
  };

  // RENDER =======================================================================================

  render() {
    /*
    // ToDo : goather back this back-handler logic
    const { selectedFilters } = this.state;
    const { navigation, notifFilterSettings } = this.props;
    const areFiltersUnchanged = shallowEqual(notifFilterSettings, selectedFilters);
    const noneSet = Object.values(selectedFilters).every(value => !value);
    return (
      <PageView
        navigation={navigation}
        navBarWithBack={{
          right: (
            <HeaderAction
              text={I18n.t('common.ok')}
              disabled={areFiltersUnchanged || noneSet}
              onPress={() => this.doSetFilters(selectedFilters)}
            />
          ),
          title: I18n.t('timeline.filtersScreen.title'),
        }}
        onBack={() => {
          if (!areFiltersUnchanged && !noneSet) {
            Alert.alert(I18n.t('common.confirmationLeaveAlert.title'), I18n.t('common.confirmationLeaveAlert.message'), [
              {
                text: I18n.t('common.cancel'),
                style: 'cancel',
              },
              {
                text: I18n.t('common.quit'),
                style: 'destructive',
                onPress: () => navigation.navigate('timeline'),
              },
            ]);
          } else {
            return true;
          }
        }}>
        {this.renderList()}
      </PageView>
    );
    */
    this.updateNavBar();
    return <PageView>{this.renderList()}</PageView>;
  }

  renderList() {
    const { notifFilters } = this.props;
    const { selectedFilters } = this.state;
    const someNotSet = Object.values(selectedFilters).some(value => !value);
    return (
      <FlatList
        // data
        data={notifFilters}
        initialNumToRender={15} // Items are thin, 15 renders ok on iPhone 13
        ListHeaderComponent={
          notifFilters.length < 2 ? null : (
            <TouchableOpacity onPress={() => this.doToggleAllFilters()}>
              <ListItem
                leftElement={<SmallText>{I18n.t('common.all')}</SmallText>}
                rightElement={
                  <Checkbox
                    customCheckboxColor={!someNotSet ? theme.ui.text.light : undefined}
                    customContainerStyle={styles.checkboxContainer}
                    checked={!someNotSet}
                    onPress={() => this.doToggleAllFilters()}
                  />
                }
              />
            </TouchableOpacity>
          )
        }
        renderItem={({ item }) => this.renderFilterItem(item)}
      />
    );
  }

  renderFilterItem(item: INotificationFilter) {
    const { selectedFilters } = this.state;
    return (
      <TouchableOpacity onPress={() => this.doToggleFilter(item)}>
        <ListItem
          leftElement={<SmallText>{I18n.t(item.i18n)}</SmallText>}
          rightElement={<Checkbox checked={selectedFilters[item.type]} onPress={() => this.doToggleFilter(item)} />}
        />
      </TouchableOpacity>
    );
  }

  // LIFECYCLE ====================================================================================

  mounted: boolean = false;

  componentDidMount(): void {
    this.mounted = true;
    this.updateNavBar();
  }

  componentWillUnmount(): void {
    this.mounted = false;
  }

  // METHODS ======================================================================================

  doToggleFilter(item: INotificationFilter) {
    if (!this.mounted) return;
    const { selectedFilters } = this.state;
    this.setState({
      selectedFilters: { ...selectedFilters, [item.type]: !selectedFilters[item.type] },
    });
  }

  doToggleAllFilters() {
    if (!this.mounted) return;
    const { selectedFilters } = this.state;
    const someNotSet = Object.values(selectedFilters).some(value => !value);
    const selectedFiltersKeys = Object.keys(selectedFilters);
    const updatedSelectedFilters = selectedFilters;
    selectedFiltersKeys.forEach(element => (updatedSelectedFilters[element] = someNotSet));
    this.setState({ selectedFilters: { ...updatedSelectedFilters } });
  }

  async doSetFilters(selectedFilters: INotifFilterSettings) {
    if (!this.mounted) return;
    const { handleSetFilters, navigation } = this.props;
    await handleSetFilters(selectedFilters);
    navigation.navigate('timeline', { reloadWithNewSettings: true });
  }

  updateNavBar() {
    if (!this.mounted) return;
    const { selectedFilters } = this.state;
    const { notifFilterSettings } = this.props;
    const areFiltersUnchanged = shallowEqual(notifFilterSettings, selectedFilters);
    this.props.navigation.setOptions({
      headerRight: () => computeNavBar(areFiltersUnchanged, () => this.doSetFilters(selectedFilters)),
    });
  }
}

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => ITimelineFiltersScreenDataProps = s => {
  const ts = moduleConfig.getState(s) as ITimeline_State;
  return {
    notifFilterSettings: ts.notifSettings.notifFilterSettings.data,
    notifFilters:
      ts?.notifDefinitions?.notifFilters?.data?.sort((a, b) => I18n.t(a.i18n).localeCompare(I18n.t(b.i18n), I18n.locale)) || [],
  };
};

const mapDispatchToProps: (
  dispatch: ThunkDispatch<any, any, any>,
  getState: () => IGlobalState,
) => ITimelineFiltersScreenEventProps = (dispatch, getState) => ({
  handleSetFilters: async (selectedFilters: INotifFilterSettings) => {
    await dispatch(setFiltersAction(selectedFilters));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TimelineFiltersScreen);
