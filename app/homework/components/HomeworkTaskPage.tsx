/**
 * HomeworkTaskPage
 *
 * Display page for just one task just one day.
 */

// imports ----------------------------------------------------------------------------------------

import style from "glamorous-native";
import * as React from "react";
const { Text } = style;

import { PageContainer } from "../../ui/ContainerContent";
import { Back } from "../../ui/headers/Back";
import { AppTitle, Header } from "../../ui/headers/Header";

import moment, { Moment } from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
import { connect } from "react-redux";
import { CommonStyles } from "../../styles/common/styles";
moment.locale("fr");

// helpers ----------------------------------------------------------------------------------------

// Header component -------------------------------------------------------------------------------

// tslint:disable-next-line:max-classes-per-file
export class HomeworkTaskPageHeader extends React.Component<
  { navigation?: any },
  undefined
> {
  public render() {
    return (
      <Header>
        <Back navigation={this.props.navigation} />
        <AppTitle>Pour le JJ/MM</AppTitle>
      </Header>
    );
  }
}

// Main component ---------------------------------------------------------------------------------

interface IHomeworkTaskPageProps {
  navigation?: any;
  dispatch?: any; // given by connect(),
  diaryId?: string;
  moment?: Moment;
  taskId?: string;
  taskTitle?: string;
  taskDescription?: string;
}

// tslint:disable-next-line:max-classes-per-file
class HomeworkTaskPage_Unconnected extends React.Component<
  IHomeworkTaskPageProps,
  {}
> {
  constructor(props) {
    super(props);
  }

  // render & lifecycle

  public render() {
    let formattedDate = this.props.moment.format("dddd LL");
    formattedDate =
      formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    return (
      <PageContainer
        style={{
          paddingHorizontal: 20,
          paddingVertical: 30
        }}
      >
        <Text fontSize={14} color={CommonStyles.textColor} lineHeight={20}>
          {formattedDate}
        </Text>
        <Text
          fontSize={14}
          color={CommonStyles.textColor}
          lineHeight={20}
          paddingTop={20}
        >
          {this.props.taskDescription}
        </Text>
      </PageContainer>
    );
  }
}

export const HomeworkTaskPage = connect((state: any) => {
  const { diaryId, moment, taskId } = state.diary.selectedDiaryTask;
  const diaries = state.diary.availableDiaries.items;
  const diary = diaries[diaryId];
  if (!diary) return {}; // this case shouldn't occur.
  const diaryTasksByDay = diary.tasksByDay;
  const dayTasks = diaryTasksByDay.find(element =>
    element.moment.isSame(moment)
  );
  if (!dayTasks) return {}; // this case shouldn't occur.
  const taskInfos = dayTasks.tasks[taskId];
  if (!taskInfos) return {}; // this case shouldn't occur.
  return {
    diaryId,
    moment,
    taskDescription: taskInfos.description,
    taskId,
    taskTitle: taskInfos.title
  };
})(HomeworkTaskPage_Unconnected);
