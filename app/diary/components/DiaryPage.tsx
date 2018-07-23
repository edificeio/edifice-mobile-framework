/**
 * DiaryPage
 *
 * Display page for all homework in a calendar-like way.
 */

// imports ----------------------------------------------------------------------------------------

import style from "glamorous-native";
import * as React from "react";
import { RefreshControl } from "react-native";
const { View, Text, FlatList } = style;
import { connect } from "react-redux";

import { CommonStyles } from "../../styles/common/styles";
import { PageContainer } from "../../ui/ContainerContent";
import { AppTitle, Header } from "../../ui/headers/Header";
import DiaryCard from "./DiaryCard";
import DiaryCircleNumber from "./DiaryCircleNumber";

import moment from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
moment.locale("fr");

import { fetchDiaryListIfNeeded } from "../actions/list";
import { diaryTaskSelected } from "../actions/selectedTask";
import { fetchDiaryTasks, fetchDiaryTasksIfNeeded } from "../actions/tasks";

import { IDiaryDay, IDiaryTask, IDiaryTasks } from "../reducers/tasks";

import today from "../../utils/today";

import I18n from "react-native-i18n";

import { Loading } from "../../ui";
import { EmptyScreen } from "../../ui/EmptyScreen";

// Header component -------------------------------------------------------------------------------

// TODO : the header must show the month and the year instead of "Homework".

// tslint:disable-next-line:max-classes-per-file
export class DiaryPageHeader extends React.Component<
  { navigation?: any; date?: moment.Moment; foozy: string },
  undefined
> {
  public render() {
    let headerText = this.props.date
      ? this.props.date.format("MMMM YYYY")
      : null;
    headerText = headerText
      ? headerText.charAt(0).toUpperCase() + headerText.slice(1)
      : I18n.t("Diary");
    return (
      <Header>
        <AppTitle>{headerText}</AppTitle>
      </Header>
    );
  }
}

// Main component ---------------------------------------------------------------------------------

interface IDiaryPageProps {
  navigation?: any;
  didInvalidate?: boolean;
  dispatch?: any; // given by connect()
  isFetching?: boolean;
  lastUpdated?: Date;
  diaryId?: string; // selected diaryId
  diaryTasksByDay?: Array<{
    id: string;
    date: moment.Moment;
    tasks: IDiaryTask[];
  }>; // for this diaryId, all the tasks by day
}

/**
 * DiaryPage
 *
 * The main component.
 */
// tslint:disable-next-line:max-classes-per-file
class DiaryPage extends React.Component<IDiaryPageProps, {}> {
  private flatList: FlatList<IDiaryTasks>; // react-native FlatList component ref // FIXME typescript error (but js works fine). Why ?
  private setFlatListRef: any; // FlatList setter, executed when this component is mounted.

  constructor(props) {
    super(props);

    // Refs
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

    return <PageContainer>{pageContent}</PageContainer>;
  }

  private renderList() {
    return (
      <View>
        <DiaryTimeLine />
        <FlatList
          innerRef={this.setFlatListRef}
          data={this.props.diaryTasksByDay}
          renderItem={({ item }) => (
            <DiaryDayTasks data={item} navigation={this.props.navigation} />
          )}
          keyExtractor={item => item.date.format("YYYY-MM-DD")}
          ListFooterComponent={() => <View height={15} />}
          refreshControl={
            <RefreshControl
              refreshing={this.props.isFetching}
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
    this.props.navigation.setParams({ "diary-date": firstItemDate });
  }
}

export default connect((state: any) => {
  // Map State To Props
  const localState = state.diary;
  const selectedDiaryId = localState.selected;
  const currentDiaryTasks = localState.tasks[selectedDiaryId];
  if (!currentDiaryTasks)
    return {
      diaryId: null,
      diaryTasksByDay: null,
      didInvalidate: true,
      isFetching: false,
      lastUpdated: null
    };
  const { didInvalidate, isFetching, lastUpdated } = currentDiaryTasks;

  // Flatten two-dimensional IOrderedArrayById
  const diaryTasksByDay = currentDiaryTasks.data.ids.map(diaryId => ({
    date: currentDiaryTasks.data.byId[diaryId].date,
    id: diaryId,
    tasks: currentDiaryTasks.data.byId[diaryId].tasks.ids.map(
      taskId => currentDiaryTasks.data.byId[diaryId].tasks.byId[taskId]
    )
  }));

  return {
    diaryId: selectedDiaryId,
    diaryTasksByDay,
    didInvalidate,
    isFetching,
    lastUpdated
  };
})(DiaryPage);

// Other container components --------------------------------------------------------------------------

/**
 * DiaryDayTasks
 *
 * Display the task list of a day (with day number and name).
 * Props:
 *     data: DiaryDay - information of the day (number and name) and list of the tasks.
 */
interface IDiaryDayTasksProps {
  data: IDiaryDay;
  navigation?: any;
  dispatch?: any;
  selectedDiary?: string;
}
// tslint:disable-next-line:max-classes-per-file
class DiaryDayTasks_Unconnected extends React.Component<
  IDiaryDayTasksProps,
  any
> {
  constructor(props: IDiaryDayTasksProps) {
    super(props);
  }

  public render() {
    const tasksAsArray = Object.values(this.props.data.tasks);
    return (
      <View>
        <DiaryDayCheckpoint
          nb={this.props.data.date.date()}
          text={this.props.data.date.format("dddd")}
          active={this.props.data.date.isSame(today(), "day")}
        />
        {tasksAsArray.map(item => (
          <DiaryCard
            title={item.title}
            content={item.content}
            key={item.id}
            onPress={() => {
              this.props.dispatch(
                diaryTaskSelected(
                  this.props.selectedDiary,
                  this.props.data.date,
                  item.id
                )
              );
              const navigation = this.props.navigation;
              navigation.navigate("DiaryTask");
            }}
          />
        ))}
      </View>
    );
  }
}

const DiaryDayTasks = connect((state: any) => {
  const ret: {
    selectedDiary: string;
  } = {
    selectedDiary: state.diary.selected
  };
  return ret;
})(DiaryDayTasks_Unconnected); // FIXME : it works but what the fuck with typescript ???

// Pure display components ------------------------------------------------------------------------

/**
 * Just display a grey vertical line at the left tall as the screen is.
 */
const DiaryTimeLine = style.view({
  backgroundColor: CommonStyles.entryfieldBorder, // TODO: Use the linear gradient instead of a plain grey
  height: "100%",
  left: 29,
  position: "absolute",
  width: 1
});

/**
 * DiaryDayCheckpoint
 *
 * Just a wrapper for the heading of a day tasks. Displays a day number in a circle and a day name
 * TODO?: May took a Date object as a parameter instead of a number and a string ?
 * Props:
 *     `style`: `any` - Glamorous style to add.
 * 	   `nb`: `number`- Day number to be displayed in a `DiaryDayCircleNumber`.
 *     `text`: `string` - Day name to be displayed.
 *     `active`: `boolean` - An active `DiaryDayCheckpoint` will be highlighted. Default `false`.
 *
 * An unstyled version on this component is available as `DiaryDayCheckpoint_Unstyled`.
 */

// tslint:disable-next-line:variable-name
const DiaryDayCheckpoint_Unstyled = ({
  style,
  nb,
  text = "",
  active = false
}: {
  style?: any;
  nb?: number;
  text?: string;
  active?: boolean;
}) => (
  <View style={[style]}>
    <DiaryCircleNumber nb={nb} active={active} />
    <Text color={CommonStyles.lightTextColor} fontSize={12}>
      {text.toUpperCase()}
    </Text>
  </View>
);

const DiaryDayCheckpoint = style(DiaryDayCheckpoint_Unstyled)({
  alignItems: "center",
  flexDirection: "row",
  marginTop: 15
});
