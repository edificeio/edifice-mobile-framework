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
import { RefreshControl, SectionList } from "react-native";
const { View } = style;

import { Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { EmptyScreen } from "../../ui/EmptyScreen";

import HomeworkTimeline from "./HomeworkTimeline";
import HomeworkDayCheckpoint from "./HomeworkDayCheckpoint";
import HomeworkCard from "./HomeworkCard";

// Type definitions
import { IHomeworkTask, IHomeworkTasks } from "../reducers/tasks";
import { IHomeworkDiary } from "../reducers/diaryList";

// Misc
import today from "../../utils/today";
import { NavigationScreenProp } from "react-navigation";
import { CommonStyles } from "../../styles/common/styles";

// Props definition -------------------------------------------------------------------------------

export interface IHomeworkPageDataProps {
  isFetching?: boolean;
  diaryId?: string;
  didInvalidate?: boolean;
  diaryInformation?: IHomeworkDiary
  tasksByDay?: Array<{
    id: string;
    date: moment.Moment;
    tasks: IHomeworkTask[];
  }>;
}

export interface IHomeworkPageEventProps {
  onFocus?: () => void;
  onRefresh?: (diaryId: string) => void;
  onSelect?: (diaryId: string, date: moment.Moment, itemId: string) => void;
  onScrollBeginDrag?: () => void;
}

export interface IHomeworkPageOtherProps {
  navigation?: NavigationScreenProp<{}>;
}

interface IHomeworkPageState {
  fetching: boolean;
}

export type IHomeworkPageProps = IHomeworkPageDataProps &
  IHomeworkPageEventProps &
  IHomeworkPageOtherProps &
  IHomeworkPageState;

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
  public state={
    fetching: false
  }

  getDerivedStateFromProps(nextProps: any, prevState: any) {
    if(nextProps.isFetching !== prevState.fetching){
      return { fetching: nextProps.isFetching};
   }
   else return null;
  }

  componentDidUpdate(prevProps: any) {
    const { isFetching } = this.props
    if(prevProps.isFetching !== isFetching){
      this.setState({ fetching: isFetching });
    }
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
      navigation,
      onRefresh,
      onSelect,
      onScrollBeginDrag
    } = this.props;
    const { fetching } = this.state

    const data = tasksByDay ? tasksByDay.map(day => ({
      title: day.date,
      data: day.tasks.map(task => ({
        ...task,
        date: day.date
      }))
    })) : []

    return (
      <View style={{ flex: 1 }}>
        <HomeworkTimeline />
        <View style={{ backgroundColor: CommonStyles.lightGrey, height: 15, width: "100%", position: "absolute", top: 0, zIndex: 1, marginLeft: 50 }} />
        <SectionList
          ref={this.setFlatListRef}
          sections={data}
          CellRendererComponent={
            ViewOverflow
          } /* TS-ISSUE : CellRendererComponent is an official FlatList prop */
          renderItem={({ item }) => (
              <HomeworkCard
              title={item.title}
              content={item.content}
              key={item.id}
              onPress={() => {
                onSelect!(diaryId!, item.date, item.id);
                navigation!.navigate("HomeworkTask", { "title": item.title });
              }}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <HomeworkDayCheckpoint
              nb={title.date()}
              text={title.format("dddd D MMMM")}
              active={title.isSame(today(), "day")}
            />
          )}
          keyExtractor={item => item.id}
          ListFooterComponent={() => <View height={15} />}
          refreshControl={
            <RefreshControl
              refreshing={fetching}
              onRefresh={() => {
                this.setState({ fetching: true })
                onRefresh(diaryId)
              }}
            />
          }
          onScrollBeginDrag={() => onScrollBeginDrag()}
          stickySectionHeadersEnabled
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
}

export default HomeworkPage;
