import { UNSTABLE_usePreventRemove, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import CheckboxButton from '~/framework/components/buttons/checkbox';
import FlatList from '~/framework/components/flatList';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import { PageView } from '~/framework/components/page';
import { setFiltersAction } from '~/framework/modules/timelinev2/actions/notifSettings';
import moduleConfig from '~/framework/modules/timelinev2/moduleConfig';
import { ITimelineNavigationParams, timelineRouteNames } from '~/framework/modules/timelinev2/navigation';
import { ITimeline_State } from '~/framework/modules/timelinev2/reducer';
import { INotificationFilter } from '~/framework/modules/timelinev2/reducer/notifDefinitions/notifFilters';
import { INotifFilterSettings } from '~/framework/modules/timelinev2/reducer/notifSettings/notifFilterSettings';
import { navBarOptions } from '~/framework/navigation/navBar';
import { shallowEqual } from '~/framework/util/object';

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

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<ITimelineNavigationParams, typeof timelineRouteNames.Filters>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('timeline.filtersScreen.title'),
});

function PreventBack(props: { onPreventBack: boolean }) {
  const navigation = useNavigation();
  UNSTABLE_usePreventRemove(props.onPreventBack, ({ data }) => {
    Alert.alert(I18n.t('common.confirmationLeaveAlert.title'), I18n.t('common.confirmationLeaveAlert.message'), [
      {
        text: I18n.t('common.cancel'),
        style: 'cancel',
      },
      {
        text: I18n.t('common.quit'),
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });
  return null;
}

export class TimelineFiltersScreen extends React.PureComponent<ITimelineFiltersScreenProps, ITimelineFiltersScreenState> {
  state: ITimelineFiltersScreenState = {
    selectedFilters: { ...this.props.notifFilterSettings },
  };

  render() {
    const { selectedFilters } = this.state;
    const { notifFilterSettings } = this.props;
    const areFiltersUnchanged = shallowEqual(notifFilterSettings, selectedFilters);
    const noneSet = Object.values(selectedFilters).every(value => !value);
    this.updateNavBar();
    return (
      <>
        <PreventBack onPreventBack={!areFiltersUnchanged || noneSet} />
        <PageView>{this.renderList()}</PageView>
      </>
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
        initialNumToRender={15} // Items are thin, 15 renders ok on iPhone 13
        ListHeaderComponent={
          notifFilters.length < 2 ? null : (
            <CheckboxButton onPress={() => this.doToggleAllFilters()} title="common.all" isChecked={!someNotSet} isAllButton />
          )
        }
        renderItem={({ item }) => this.renderFilterItem(item)}
      />
    );
  }

  renderFilterItem(item: INotificationFilter) {
    const { selectedFilters } = this.state;
    return <CheckboxButton onPress={() => this.doToggleFilter(item)} title={item.i18n} isChecked={selectedFilters[item.type]} />;
  }

  mounted: boolean = false;

  componentDidMount(): void {
    this.mounted = true;
    this.updateNavBar();
  }

  componentWillUnmount(): void {
    this.mounted = false;
  }

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
    const noneSet = Object.values(selectedFilters).every(value => !value);
    this.props.navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <NavBarAction
          title={I18n.t('timeline.filtersScreen.apply')}
          disabled={areFiltersUnchanged || noneSet}
          onPress={() => this.doSetFilters(selectedFilters)}
        />
      ),
    });
  }
}

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
