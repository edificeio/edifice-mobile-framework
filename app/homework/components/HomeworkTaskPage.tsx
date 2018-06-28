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
  diaryId: string;
  moment: Moment;
  taskId: string;
  taskTitle: string;
  taskDescription: string;
}

// tslint:disable-next-line:max-classes-per-file
class HomeworkTaskPage_Unconnected extends React.Component<{}, {}> {
  constructor(props) {
    super(props);
  }

  // render & lifecycle

  public render() {
    return (
      <PageContainer>
        <Text>Salut c'est ouam</Text>
      </PageContainer>
    );
  }
}

export const HomeworkTaskPage = connect((state: any) => {
  const { diaryId, moment, taskId } = state.diary.selectedDiaryTask;
  //console.warn("diaryID : " + diaryId);
  //console.warn(state.diary.diaries);
  // const diary = state.diary.diaries.items[diaryId];
  // console.warn(diary);
  /*
  const dayTasks = diary.items.find(element => element.moment.isSame(moment));
  const taskTitle = dayTasks[taskId].title;
  const taskDescription = dayTasks[taskId].description;
  return { diaryId, moment, taskId, taskTitle, taskDescription };
  */
  return {};
})(HomeworkTaskPage_Unconnected);
