/**
 * DiaryPage
 *
 * Display page for all homework in a calendar-like way.
 *
 * Props :
 *    navigation : React Navigation instance.
 *    dispatch : React-Redux dispatch function.
 *    isFetching : is data currently fetching from the server.
 *    diaryId : displayed diaryId.
 *    diaryTasksByDay: list of data.
 */

// Imports ----------------------------------------------------------------------------------------

// Libraries
import style from "glamorous-native";
import * as React from "react";
import I18n from "react-native-i18n";
import ViewOverflow from "react-native-view-overflow";

import moment from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
moment.locale("fr");

// Components
import { RefreshControl } from "react-native";
const { View, FlatList } = style;

import { Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { EmptyScreen } from "../../ui/EmptyScreen";

import DiaryDayTasks from "./DiaryDayTasks";
import DiaryTimeline from "./DiaryTimeline";

// Actions
import { fetchDiaryListIfNeeded } from "../actions/list";
import { diaryTaskSelected } from "../actions/selectedTask";
import { fetchDiaryTasks, fetchDiaryTasksIfNeeded } from "../actions/tasks";

// Type definitions
import { IDiaryTask, IDiaryTasks } from "../reducers/tasks";

// Misc
import today from "../../utils/today";

// Main component ---------------------------------------------------------------------------------
export interface IDiaryPageProps {
  navigation?: any; // React Navigation
  dispatch?: any; // given by connect() // TODO : use mapDispatchToProps in container component
  // Data
  isFetching?: boolean;
  diaryId?: string; // selected diaryId
  diaryTasksByDay?: Array<{
    id: string;
    date: moment.Moment;
    tasks: IDiaryTask[];
  }>; // for this diaryId, all the tasks by day
}

export class DiaryPage extends React.PureComponent<IDiaryPageProps, {}> {
  private flatList: FlatList<IDiaryTasks>; // react-native FlatList component ref // TS-ISSUE FlatList does exists.
  private setFlatListRef: any; // FlatList setter, executed when this component is mounted.

  constructor(props) {
    super(props);

    // Refs init
    this.flatList = null;
    this.setFlatListRef = element => {
      this.flatList = element;
    };
  }

  // Render

  public render() {
    const pageContent = this.props.diaryTasksByDay
      ? this.props.diaryTasksByDay.length === 0
        ? this.props.isFetching
          ? this.renderLoading()
          : this.renderEmptyScreen()
        : this.renderList()
      : this.renderLoading();

    return (
      <PageContainer>
        <ConnectionTrackingBar />
        {pageContent}
      </PageContainer>
    );
  }

  private renderList() {
    const { diaryId, diaryTasksByDay, isFetching, navigation } = this.props;

    return (
      <View style={{ flex: 1 }}>
        <DiaryTimeline />
        <FlatList
          innerRef={this.setFlatListRef}
          data={diaryTasksByDay}
          CellRendererComponent={ViewOverflow} // TS-ISSUE : it DOES exist in React Native...
          renderItem={({ item }) => (
            <ViewOverflow>
              <DiaryDayTasks
                data={item}
                onSelect={(itemId, date) => {
                  this.props.dispatch(diaryTaskSelected(diaryId, date, itemId));
                  navigation.navigate("DiaryTask");
                }}
              />
            </ViewOverflow>
          )}
          keyExtractor={item => item.date.format("YYYY-MM-DD")}
          ListFooterComponent={() => <View height={15} />}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() => this.forceFetchDiaryTasks()}
            />
          }
          onViewableItemsChanged={this.handleViewableItemsChanged}
        />
      </View>
    );
  }

  private renderEmptyScreen() {
    return (
      <EmptyScreen
        imageSrc={require("../../../assets/images/empty-screen/diary.png")}
        imgWidth={265.98}
        imgHeight={279.97}
        text={I18n.t("diary-emptyScreenText")}
        title={I18n.t("diary-emptyScreenTitle")}
      />
    );
  }

  private renderLoading() {
    return <Loading />;
  }

  // Lifecycle

  public componentDidMount() {
    this.fetchDiaryList();
  }

  public componentDidUpdate() {
    const { diaryTasksByDay, isFetching, navigation } = this.props;
    if (
      // If it's an empty screen, we put today's month in the header
      diaryTasksByDay &&
      diaryTasksByDay.length === 0 &&
      !isFetching &&
      moment.isMoment(navigation.getParam("diary-date")) &&
      !navigation.getParam("diary-date").isSame(today(), "month") // Prevent infinite update
    ) {
      navigation.setParams({ "diary-date": false }, "Diary");
    }
  }

  // Fetch methods

  public fetchDiaryList() {
    this.props.dispatch(fetchDiaryListIfNeeded());
  }

  public fetchDiaryTasks() {
    this.props.dispatch(fetchDiaryTasksIfNeeded(this.props.diaryId));
  }

  public forceFetchDiaryTasks() {
    this.props.dispatch(fetchDiaryTasks(this.props.diaryId));
  }

  // Event Handlers

  public handleViewableItemsChanged = info => {
    const firstItem = info.viewableItems[0];
    if (!firstItem) return;
    const firstItemDate = firstItem.item.date;
    this.props.navigation.setParams({ "diary-date": firstItemDate }, "Diary");
    // TODO : this line causes a re-render, AND a re-parse of all the html contents... Needs to be cached.
  } // FIXME: Syntax error on this line because of a collision between TSlint and Prettier.
}
