import { Moment } from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { getSession } from '~/framework/modules/auth/reducer';
import { deleteHomeworkDiaryEntry } from '~/framework/modules/homework/actions/deleteEntry';
import { toggleHomeworkDiaryEntryStatus } from '~/framework/modules/homework/actions/entryStatus';
import { fetchHomeworkTasks } from '~/framework/modules/homework/actions/tasks';
import {
  HomeworkTaskDetailsScreen,
  HomeworkTaskDetailsScreenDataProps,
  HomeworkTaskDetailsScreenEventProps,
  IHomeworkTaskDetailsScreenProps,
} from '~/framework/modules/homework/components/HomeworkTaskDetailsScreen';

const mapStateToProps: (state: any) => HomeworkTaskDetailsScreenDataProps = state => {
  const session = getSession();
  const localState = state.homework;
  const selectedDiaryId = localState.selectedDiary;
  const diaryListData = localState.diaryList.data;
  const diaryInformation = diaryListData[selectedDiaryId];
  return {
    diaryInformation,
    session,
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>) => HomeworkTaskDetailsScreenEventProps = dispatch => ({
  handleDeleteHomeworkEntry: async (diaryId: string, entryId: string, date: Moment) => {
    return (await dispatch(deleteHomeworkDiaryEntry(diaryId, entryId, date))) as unknown as undefined;
  },
  handleToggleHomeworkEntryStatus: async (diaryId: string, entryId: string, finished: boolean) => {
    return (await dispatch(toggleHomeworkDiaryEntryStatus(diaryId, entryId, finished))) as unknown as undefined;
  },
  handleGetHomeworkTasks: diaryId => {
    return dispatch(fetchHomeworkTasks(diaryId));
  },
  dispatch,
});

export interface IHomeworkTaskDetailsScreenNavigationParams {
  task: {
    date: Moment;
    id: string;
    title: string;
    content: string;
    taskId: string;
    type: string;
    finished: boolean;
  };
  diaryId: string;
}

class HomeworkTaskDetailsScreenContainer extends React.PureComponent<IHomeworkTaskDetailsScreenProps, object> {
  render() {
    return <HomeworkTaskDetailsScreen {...this.props} />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeworkTaskDetailsScreenContainer);
