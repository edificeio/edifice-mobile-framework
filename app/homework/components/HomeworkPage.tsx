/**
 * Homework
 *
 * Display page for all homework in a calendar-like way.
 */

// imports ----------------------------------------------------------------------------------------

import style from "glamorous-native";
import * as React from "react";
import { ActivityIndicator, RefreshControl } from "react-native";
const { View, Text, FlatList, TouchableOpacity } = style;
import { connect } from "react-redux";

import { CommonStyles } from "../../styles/common/styles";
import { Content, PageContainer } from "../../ui/ContainerContent";
import { AppTitle, Header } from "../../ui/headers/Header";

import moment from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
moment.locale("fr");

import I18n from "react-native-i18n";

import { fetchDiaryTasksIfNeeded } from "../actions/diaryTasks";

import { IDiaryTasksState, IDiaryDayTasks } from "../reducers/diaryTasks"; // Type definitions

// helpers ----------------------------------------------------------------------------------------

const runNextFrame = fn => {
  requestAnimationFrame(() => {
    requestAnimationFrame(fn);
  });
};

/**
 * Extract a short version of the task's description, to be shown on the landing homework page.
 * The short version stops at the first new line, or before SHORT_TASK_MAX_SIZE characters (without cutting words).
 * The short version DOES include the ending "..." if necessary.
 * @param description description to be shortened.
 */
function extractShortTask(description) {
  const firstLine = description.split(NEW_LINE_CHARACTER, 1)[0];
  let trimmedFirstLine = (firstLine + " ").substr(0, SHORT_TASK_MAX_SIZE);
  trimmedFirstLine = trimmedFirstLine.substr(
    0,
    Math.min(trimmedFirstLine.length, trimmedFirstLine.lastIndexOf(" "))
  );
  trimmedFirstLine = trimmedFirstLine.trim();
  if (trimmedFirstLine.length !== description.length) trimmedFirstLine += "...";
  return trimmedFirstLine;
}
const SHORT_TASK_MAX_SIZE: number = 70;
const NEW_LINE_CHARACTER: string = "\n";

// Header component -------------------------------------------------------------------------------

// tslint:disable-next-line:max-classes-per-file
export class HomeworkPageHeader extends React.Component<
  { navigation?: any },
  undefined
> {
  public render() {
    return (
      <Header>
        <AppTitle>Homework</AppTitle>
      </Header>
    );
  }
}

// Main component ---------------------------------------------------------------------------------

interface IHomeworkPageProps {
  navigation?: any;
  didInvalidate?: boolean;
  dispatch?: any; // given by connect()
  isFetching?: boolean;
  items?: IDiaryDayTasks[];
  lastUpdated?: Date;
}

/**
 * HomeworkPage
 *
 * The main component.
 */
// tslint:disable-next-line:max-classes-per-file
class HomeworkPage_Unconnected extends React.Component<IHomeworkPageProps, {}> {
  private flatList: FlatList<IDiaryDayTasks>; // react-native FlatList component ref
  private setFlatListRef: any; // FlatList setter, executed when this component is mounted.

  constructor(props) {
    super(props);

    // Refs
    this.flatList = null;
    this.setFlatListRef = element => {
      this.flatList = element;
    };
  }

  // render & lifecycle

  public render() {
    return (
      <PageContainer>
        <HomeworkTimeLine />
        <FlatList
          innerRef={this.setFlatListRef}
          data={this.props.items}
          renderItem={({ item }) => (
            <HomeworkDayTasks data={item} navigation={this.props.navigation} />
          )}
          keyExtractor={(item, index) => item.moment.format("YYYY-MM-DD")}
          ListHeaderComponent={() => <View height={15} />}
          refreshControl={
            <RefreshControl
              refreshing={this.props.isFetching}
              onRefresh={() => this.fetchTasks()}
            />
          }
        />
      </PageContainer>
    );
  }

  public componentDidMount() {
    this.fetchTasks();
  }

  public async fetchTasks() {
    this.props.dispatch(fetchDiaryTasksIfNeeded("ceci-est-un-id"));
  }
}

export const HomeworkPage = connect((state: any) => {
  const {
    didInvalidate,
    isFetching,
    items,
    lastUpdated
  }: IHomeworkPageProps = state.diary.diaryTasks;
  return { didInvalidate, isFetching, items, lastUpdated };
})(HomeworkPage_Unconnected);

// Functional components --------------------------------------------------------------------------

/**
 * HomeworkDayTasks
 *
 * Display the task list of a day (with day number and name).
 * Props:
 *     data: HomeworkDay - information of the day (number and name) and list of the tasks.
 */
interface IHomeworkDayTasksProps {
  data: IDiaryDayTasks;
  navigation?: any;
}
// tslint:disable-next-line:max-classes-per-file
class HomeworkDayTasks extends React.Component<IHomeworkDayTasksProps, any> {
  constructor(props: IHomeworkDayTasksProps) {
    super(props);
  }

  public render() {
    return (
      <View>
        <HomeworkDayCheckpoint
          nb={this.props.data.moment.date()}
          text={this.props.data.moment.format("dddd")}
          active={this.props.data.moment.isSame(moment(), "day")}
        />
        {this.props.data.tasks.map(item => (
          <HomeworkCard
            title={item.title}
            description={item.description}
            key={item.id}
            navigation={this.props.navigation}
          />
        ))}
      </View>
    );
  }
}

// Pure display components ------------------------------------------------------------------------

/**
 * Just display a grey vertical line at the left tall as the screen is.
 */
const HomeworkTimeLine = style.view({
  backgroundColor: CommonStyles.entryfieldBorder, // TODO: Use the linear gradient instead of a plain grey
  height: "100%",
  left: 29,
  position: "absolute",
  width: 1
});

/**
 * HomeworkDayCheckpoint
 *
 * Just a wrapper for the heading of a day tasks. Displays a day number in a circle and a day name
 * TODO?: May took a Date object as a parameter instead of a number and a string ?
 * Props:
 *     `style`: `any` - Glamorous style to add.
 * 	   `nb`: `number`- Day number to be displayed in a `HomeworkDayCircleNumber`.
 *     `text`: `string` - Day name to be displayed.
 *     `active`: `boolean` - An active `HomeworkDayCheckpoint` will be highlighted. Default `false`.
 *
 * An unstyled version on this component is available as `HomeworkDayCheckpoint_Unstyled`.
 */

// tslint:disable-next-line:variable-name
const HomeworkDayCheckpoint_Unstyled = ({
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
    <HomeworkDayCircleNumber nb={nb} active={active} />
    <Text color={CommonStyles.lightTextColor} fontSize={12}>
      {text.toUpperCase()}
    </Text>
  </View>
);

const HomeworkDayCheckpoint = style(HomeworkDayCheckpoint_Unstyled)({
  alignItems: "center",
  flexDirection: "row"
});

/**
 * HomeworkDayCircleNumber
 *
 * Display a number in a circle elegantly. Mostly used to show a day number.
 * Props:
 *     `style`: `any` - Glamorous style to add.
 * 	   `nb`: `number` - Just as simple as the number to be displayed.
 *     `active`: `boolean` - An active `HomeworkDayCircleNumber` will be highlighted.
 * FIXME: style.Text component gives Invariant Violation, must use `const {Text} = style`. Why ?
 * TODO: When active, the blue background should be a gradient, according to the mockup.
 *
 * An unstyled version on this component is available as `HomeworkDayCircleNumber_Unstyled`.
 */
// tslint:disable-next-line:variable-name
const HomeworkDayCircleNumber_Unstyled = ({
  style,
  nb,
  active = false
}: {
  style?: any;
  nb?: number;
  active?: boolean;
}) => (
  <View style={[style]}>
    <Text
      color={active ? CommonStyles.tabBottomColor : CommonStyles.lightTextColor}
      fontSize={12}
    >
      {nb}
    </Text>
  </View>
);

const HomeworkDayCircleNumber = style(HomeworkDayCircleNumber_Unstyled)(
  {
    alignItems: "center",
    borderColor: CommonStyles.tabBottomColor,
    borderRadius: 15,
    borderStyle: "solid",
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    marginHorizontal: 14,
    shadowColor: "#6B7C93",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 30
  },
  ({ active }) => ({
    backgroundColor: active
      ? CommonStyles.actionColor
      : CommonStyles.tabBottomColor
  })
);

/**
 * HomeworkCard
 *
 * Like `Card`, but some margin and padding, custom shadow and rounded.
 *
 * An unstyled version on this component is available as `HomeworkCard_Unstyled`.
 */

// tslint:disable-next-line:variable-name
const HomeworkCard_Unstyled = ({
  style,
  title,
  description,
  navigation
}: {
  style?: any;
  title?: string;
  description?: string;
  navigation?: any;
}) => (
  <TouchableOpacity
    style={[style]}
    onPress={() => {
      navigation.navigate("HomeworkTask");
    }}
  >
    <Text fontSize={14} color={CommonStyles.textColor} lineHeight={20}>
      {extractShortTask(description)}
    </Text>
    <Text fontSize={12} color={CommonStyles.lightTextColor} marginTop={5}>
      {title}
    </Text>
  </TouchableOpacity>
);

const HomeworkCard = style(HomeworkCard_Unstyled)({
  backgroundColor: "#FFF",
  borderRadius: 5,
  marginBottom: 15,
  marginLeft: 60,
  marginRight: 20,
  paddingHorizontal: 15,
  paddingVertical: 20,
  shadowColor: "#6B7C93",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2
});
