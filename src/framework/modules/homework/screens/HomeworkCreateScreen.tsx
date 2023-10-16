import { Moment } from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { ImagePicked, imagePickedToLocalFile } from '~/framework/components/menus/actions';
import { createHomeworkDiaryEntry, uploadHomeworkDiaryEntryImages } from '~/framework/modules/homework/actions/createEntry';
import { fetchHomeworkTasks } from '~/framework/modules/homework/actions/tasks';
import {
  HomeworkCreateScreen,
  HomeworkCreateScreenDataProps,
  HomeworkCreateScreenEventProps,
  IHomeworkCreateScreenProps,
} from '~/framework/modules/homework/components/HomeworkCreateScreen';
import { homeworkRouteNames } from '~/framework/modules/homework/navigation';
import { SyncedFile } from '~/framework/util/fileHandler';
import { getState as getConnectionTrackerState } from '~/infra/reducers/connectionTracker';

const mapStateToProps: (state: any) => HomeworkCreateScreenDataProps = state => {
  const localState = state.homework;
  const selectedDiaryId = localState.selectedDiary;

  return {
    diaryId: selectedDiaryId,
    connectionTrackerState: getConnectionTrackerState(state),
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>) => HomeworkCreateScreenEventProps = dispatch => ({
  handleUploadEntryImages: async (images: ImagePicked[]) => {
    const localFiles = images.map(img => imagePickedToLocalFile(img));
    return dispatch(uploadHomeworkDiaryEntryImages(localFiles)) as unknown as Promise<SyncedFile[]>;
  },
  handleCreateDiaryEntry: async (
    diaryId: string,
    date: Moment,
    title: string,
    content: string,
    uploadedEntryImages?: SyncedFile[],
  ) => {
    return (await dispatch(createHomeworkDiaryEntry(diaryId, date, title, content, uploadedEntryImages))) as unknown as
      | string
      | undefined;
  },
  handleGetHomeworkTasks: diaryId => {
    return dispatch(fetchHomeworkTasks(diaryId));
  },
  dispatch,
});

export interface HomeworkCreateScreenNavigationParams {
  sourceRoute?: keyof typeof homeworkRouteNames;
}

class HomeworkCreateScreenContainer extends React.PureComponent<IHomeworkCreateScreenProps, object> {
  render() {
    return <HomeworkCreateScreen {...this.props} />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeworkCreateScreenContainer);
