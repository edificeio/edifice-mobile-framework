/**
 * HomeworkPage
 *
 * Display page for all homework in a calendar-like way.
 *
 * Props :
 *    `navigation` - React Navigation instance.
 *    `dispatch` - React-Redux dispatch function.
 *    `isFetching` - is data currently fetching from the server.
 *    `homeworkId` - displayed homeworkId.
 *    `homeworkTasksByDay` - list of data.
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

import HomeworkDayTasks from "./HomeworkDayTasks";
import HomeworkTimeline from "./HomeworkTimeline";

// Actions
import { fetchHomeworkListIfNeeded } from "../actions/list";
import { homeworkTaskSelected } from "../actions/selectedTask";
import { fetchHomeworkTasks, fetchHomeworkTasksIfNeeded } from "../actions/tasks";

// Type definitions
import { IHomeworkTask, IHomeworkTasks } from "../reducers/tasks";

// Misc
import today from "../../utils/today";

// Main component ---------------------------------------------------------------------------------
export interface IHomeworkPageProps {
  navigation?: any;
  dispatch?: any;
  // Data
  isFetching?: boolean;
  homeworkId?: string;
  homeworkTasksByDay?: Array<{
    id: string;
    date: moment.Moment;
    tasks: IHomeworkTask[];
  }>;
}

export class HomeworkPage extends React.PureComponent<IHomeworkPageProps, {}> {
  private flatList: FlatList<IHomeworkTasks>; // react-native FlatList component ref // TS-ISSUE FlatList does exists.
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
    const pageContent = this.props.homeworkTasksByDay
      ? this.props.homeworkTasksByDay.length === 0
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
    const { homeworkId, homeworkTasksByDay, isFetching, navigation } = this.props;

    return (
      <View style={{ flex: 1 }}>
        <HomeworkTimeline />
        <FlatList
          innerRef={this.setFlatListRef}
          data={homeworkTasksByDay}
          CellRendererComponent={ViewOverflow} // TS-ISSUE : it DOES exist in React Native...
          renderItem={({ item }) => (
            <ViewOverflow>
              <HomeworkDayTasks
                data={item}
                onSelect={(itemId, date) => {
                  this.props.dispatch(homeworkTaskSelected(homeworkId, date, itemId));
                  navigation.navigate("HomeworkTask");
                }}
              />
            </ViewOverflow>
          )}
          keyExtractor={item => item.date.format("YYYY-MM-DD")}
          ListFooterComponent={() => <View height={15} />}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() => this.forceFetchHomeworkTasks()}
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
        imageSrc={require("../../../assets/images/empty-screen/homework.png")}
        imgWidth={265.98}
        imgHeight={279.97}
        text={I18n.t("homework-emptyScreenText")}
        title={I18n.t("homework-emptyScreenTitle")}
      />
    );
  }

  private renderLoading() {
    return <Loading />;
  }

  // Lifecycle

  public componentDidMount() {
    this.fetchHomeworkList();
  }

  public componentDidUpdate() {
    const { homeworkTasksByDay, isFetching, navigation } = this.props;
    if (
      // If it's an empty screen, we put today's month in the header
      homeworkTasksByDay &&
      homeworkTasksByDay.length === 0 &&
      !isFetching &&
      moment.isMoment(navigation.getParam("homework-date")) &&
      !navigation.getParam("homework-date").isSame(today(), "month") // Prevent infinite update
    ) {
      navigation.setParams({ "homework-date": false }, "Homework");
    }
  }

  // Fetch methods

  public fetchHomeworkList() {
    this.props.dispatch(fetchHomeworkListIfNeeded());
  }

  public fetchHomeworkTasks() {
    this.props.dispatch(fetchHomeworkTasksIfNeeded(this.props.homeworkId));
  }

  public forceFetchHomeworkTasks() {
    this.props.dispatch(fetchHomeworkTasks(this.props.homeworkId));
  }

  // Event Handlers

  public handleViewableItemsChanged = info => {
    const firstItem = info.viewableItems[0];
    if (!firstItem) return;
    const firstItemDate = firstItem.item.date;
    this.props.navigation.setParams({ "homework-date": firstItemDate }, "Homework");
    // TODO : this line causes a re-render, AND a re-parse of all the html contents... Needs to be cached.
  } // FIXME: Syntax error on this line because of a collision between TSlint and Prettier.
}

export default HomeworkPage;
