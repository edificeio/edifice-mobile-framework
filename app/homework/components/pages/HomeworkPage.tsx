/**
 * HomeworkPage
 *
 * Display page for all homework in a calendar-like way.
 *
 * Props :
 *    `isFetching` - is data currently fetching from the server.
 *    `diaryId` - displayed diaryId.
 *    `tasksByDay` - list of data.
 *
 *    `onMount` - fired when component did mount.
 *    `onRefresh` - fired when the user ask to refresh the list.
 *    `onSelect` - fired when the user touches a displayed task.
 *
 *    `navigation` - React Navigation instance.
 */

// Imports ----------------------------------------------------------------------------------------

// Libraries
import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import ViewOverflow from "react-native-view-overflow";

import moment from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
moment.locale("fr");

// Components
import { RefreshControl } from "react-native";
const { View, FlatList } = style;

import { Loading } from "../../../ui";
import ConnectionTrackingBar from "../../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../../ui/ContainerContent";
import { EmptyScreen } from "../../../ui/EmptyScreen";

import HomeworkDayTasks from "../HomeworkDayTasks";
import HomeworkTimeline from "../HomeworkTimeline";

// Type definitions
import { IHomeworkTask, IHomeworkTasks } from "../../reducers/tasks";

// Misc
import today from "../../../utils/today";

// Props definition -------------------------------------------------------------------------------

export interface IHomeworkPageDataProps {
  isFetching?: boolean;
  diaryId?: string;
  didInvalidate?: boolean;
  tasksByDay?: Array<{
    id: string;
    date: moment.Moment;
    tasks: IHomeworkTask[];
  }>;
}

export interface IHomeworkPageEventProps {
  onRefresh?: (diaryId: string) => void;
  onSelect?: (diaryId: string, date: moment.Moment, itemId: string) => void;
  onScrollBeginDrag?: () => void;
}

export interface IHomeworkPageOtherProps {
  navigation?: any;
}

export type IHomeworkPageProps = IHomeworkPageDataProps &
  IHomeworkPageEventProps &
  IHomeworkPageOtherProps;

// Main component ---------------------------------------------------------------------------------

export class HomeworkPage extends React.PureComponent<IHomeworkPageProps, {}> {
  private flatList: FlatList<
    IHomeworkTasks
  >; /* TS-ISSUE : FlatList is declared in glamorous */ // react-native FlatList component ref

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
    const pageContent =
      this.props.tasksByDay && this.props.tasksByDay.length
        ? this.renderList()
        : this.props.didInvalidate
        ? this.props.isFetching
          ? this.renderLoading()
          : this.renderEmptyScreen()
        : this.renderEmptyScreen();

    return (
      <PageContainer>
        <ConnectionTrackingBar />
        {pageContent}
      </PageContainer>
    );
  }

  private renderList() {
    const {
      diaryId,
      tasksByDay,
      isFetching,
      navigation,
      onRefresh,
      onSelect,
      onScrollBeginDrag
    } = this.props;

    return (
      <View style={{ flex: 1 }}>
        <HomeworkTimeline />
        <FlatList
          innerRef={this.setFlatListRef}
          data={tasksByDay}
          CellRendererComponent={
            ViewOverflow
          } /* TS-ISSUE : CellRendererComponent is an official FlatList prop */
          renderItem={({ item }) => (
            <ViewOverflow>
              <HomeworkDayTasks
                data={item}
                onSelect={(itemId, date) => {
                  onSelect(diaryId, date, itemId);
                  navigation.navigate("HomeworkTask"); // TODO : Should the navigation be in mapDispatchToProps or not ?
                }}
              />
            </ViewOverflow>
          )}
          keyExtractor={item => item.date.format("YYYY-MM-DD")}
          ListFooterComponent={() => <View height={15} />}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() => onRefresh(diaryId)}
            />
          }
          onViewableItemsChanged={this.handleViewableItemsChanged}
          onScrollBeginDrag={() => onScrollBeginDrag()}
        />
      </View>
    );
  }

  private renderEmptyScreen() {
    return (
      <EmptyScreen
        imageSrc={require("../../../../assets/images/empty-screen/homework.png")}
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

  public componentDidUpdate() {
    const { tasksByDay, isFetching, navigation } = this.props;
    if (
      // If it's an empty screen, we put today's month in the header
      tasksByDay &&
      tasksByDay.length === 0 &&
      !isFetching &&
      moment.isMoment(navigation.getParam("homework-date")) &&
      !navigation.getParam("homework-date").isSame(today(), "month") // Prevent infinite update
    ) {
      navigation.setParams({ "homework-date": false }, "Homework");
    }
  }

  // Event Handlers

  public handleViewableItemsChanged = info => {
    const firstItem = info.viewableItems[0];
    if (!firstItem) return;
    const firstItemDate = firstItem.item.date;
    this.props.navigation.setParams(
      { "homework-date": firstItemDate },
      "Homework"
    );
    // TODO : this line causes a re-render, AND a re-parse of all the html contents... Needs to be cached.
  }; /* TS-ISSUE: Syntax error on this line because of a collision between TSlint and Prettier. */
}

export default HomeworkPage;
