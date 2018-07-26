/**
 * DiaryTaskPage
 *
 * Display page for just one task just one day.
 */

// imports ----------------------------------------------------------------------------------------

import style from "glamorous-native";
import * as React from "react";
const { Text, ScrollView, View } = style;

import { PageContainer } from "../../ui/ContainerContent";
import { Back } from "../../ui/headers/Back";
import { AppTitle, Header } from "../../ui/headers/Header";

import moment, { Moment } from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
import { connect } from "react-redux";
import { CommonStyles } from "../../styles/common/styles";
moment.locale("fr");

import HTMLAdaptor from "../../infra/HTMLAdaptor";
import HtmlToText from "../../infra/htmlConverter/text";

import memoize from "memoize-one";

// helpers ----------------------------------------------------------------------------------------

// Header component -------------------------------------------------------------------------------

// tslint:disable-next-line:max-classes-per-file
class DiaryTaskPageHeader_Unconnected extends React.Component<
  { navigation?: any; title: string },
  undefined
> {
  public render() {
    const AppTitleStyled = style(AppTitle)({ textAlign: "left" });
    return (
      <Header>
        <Back navigation={this.props.navigation} />
        <AppTitleStyled>{this.props.title}</AppTitleStyled>
      </Header>
    );
  }
}

export const DiaryTaskPageHeader = connect((state: any) => {
  // Map state to props
  // Map state to props
  const localState = state.diary.selectedTask;
  const { diaryId, date, taskId } = localState;
  // Get diary, then day, then task content
  const diaryDays = state.diary.tasks[diaryId];
  if (!diaryDays) return {}; // this case shouldn't occur.
  const dateId = date.format("YYYY-MM-DD");
  const diaryTasksThisDay = diaryDays.data.byId[dateId];
  if (!diaryTasksThisDay) return {}; // this case shouldn't occur.
  const taskInfos = diaryTasksThisDay.tasks.byId[taskId];
  if (!taskInfos) return {}; // this case shouldn't occur.
  // Format props
  return {
    title: taskInfos.title
  };
})(DiaryTaskPageHeader_Unconnected);

// Main component ---------------------------------------------------------------------------------

interface IDiaryTaskPageProps {
  navigation?: any;
  dispatch?: any; // given by connect(),
  diaryId?: string;
  date?: Moment;
  taskId?: string;
  taskTitle?: string;
  taskContent?: string;
}

// tslint:disable-next-line:max-classes-per-file
class DiaryTaskPage_Unconnected extends React.Component<
  IDiaryTaskPageProps,
  {}
> {
  constructor(props) {
    super(props);
  }

  public convert = memoize(html => HtmlToText(html, false).render);

  // render & lifecycle

  public render() {
    let formattedDate = this.props.date.format("dddd LL");
    formattedDate =
      formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    return (
      <PageContainer>
        <ScrollView
          alwaysBounceVertical={false}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 30
          }}
        >
          <Text fontSize={14} color={CommonStyles.textColor} lineHeight={20}>
            {formattedDate}
          </Text>
          <View
            // fontSize={14}
            // color={CommonStyles.textColor}
            // lineHeight={20}
            paddingTop={20}
          >
            <Text>{this.convert(this.props.taskContent)}</Text>
          </View>
        </ScrollView>
      </PageContainer>
    );
  }
}

export const DiaryTaskPage = connect((state: any) => {
  // Map state to props
  const localState = state.diary.selectedTask;
  const { diaryId, date, taskId } = localState;
  // Get diary, then day, then task content
  const diaryDays = state.diary.tasks[diaryId];
  if (!diaryDays) return {}; // this case shouldn't occur.
  const dateId = date.format("YYYY-MM-DD");
  const diaryTasksThisDay = diaryDays.data.byId[dateId];
  if (!diaryTasksThisDay) return {}; // this case shouldn't occur.
  const taskInfos = diaryTasksThisDay.tasks.byId[taskId];
  if (!taskInfos) return {}; // this case shouldn't occur.
  // Format props
  return {
    date,
    diaryId,
    taskContent: taskInfos.content,
    taskId,
    taskTitle: taskInfos.title
  };
})(DiaryTaskPage_Unconnected);
