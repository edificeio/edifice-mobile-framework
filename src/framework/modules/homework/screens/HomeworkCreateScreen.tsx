import { Moment } from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { ImagePicked, imagePickedToLocalFile } from '~/framework/components/menus/actions';
import {
  HomeworkCreateScreen,
  HomeworkCreateScreenEventProps,
  IHomeworkCreateScreenProps,
} from '~/framework/modules/homework/components/HomeworkCreateScreen';
import { SyncedFile } from '~/framework/util/fileHandler';

import { createHomeworkDiaryEntry, uploadHomeworkDiaryEntryImages } from '../actions/createEntry';
import { fetchHomeworkTasks } from '../actions/tasks';

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

class HomeworkCreateScreenContainer extends React.PureComponent<IHomeworkCreateScreenProps, object> {
  render() {
    return <HomeworkCreateScreen {...this.props} />;
  }
}

export default connect(undefined, mapDispatchToProps)(HomeworkCreateScreenContainer);
