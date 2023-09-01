import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { getSession } from '~/framework/modules/auth/reducer';
import homeworkDiarySelected from '~/framework/modules/homework/actions/selectedDiary';
import {
  HomeworkSelectScreen,
  HomeworkSelectScreenDataProps,
  HomeworkSelectScreenEventProps,
  HomeworkSelectScreenProps,
} from '~/framework/modules/homework/components/HomeworkSelectScreen';

import { fetchHomeworkDiaryList } from '../actions/diaryList';
import { hasPermissionManager, modifyHomeworkEntryResourceRight } from '../rights';

const mapStateToProps: (state: IGlobalState) => HomeworkSelectScreenDataProps = (state: IGlobalState) => {
  const session = getSession();
  const localState = state.homework;
  const homeworkDiaryList = localState.diaryList;
  if (!homeworkDiaryList.data)
    return {
      diaryList: undefined,
    };
  const flatHomeworkDiaryList = Object.getOwnPropertyNames(homeworkDiaryList.data).map(diaryId => ({
    id: diaryId,
    name: homeworkDiaryList.data[diaryId].name,
    title: homeworkDiaryList.data[diaryId].title,
    thumbnail: homeworkDiaryList.data[diaryId].thumbnail,
    shared: homeworkDiaryList.data[diaryId].shared,
    owner: homeworkDiaryList.data[diaryId].owner,
  }));
  const diaryListWithCreationRight = flatHomeworkDiaryList.filter(diary =>
    hasPermissionManager(diary, modifyHomeworkEntryResourceRight, session),
  );

  return {
    session,
    diaryList: diaryListWithCreationRight,
    isFetching: homeworkDiaryList.isFetching,
    didInvalidate: homeworkDiaryList.didInvalidate,
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>) => HomeworkSelectScreenEventProps = dispatch => {
  return {
    dispatch,
    onRefresh: () => dispatch(fetchHomeworkDiaryList()),
    onSelect: diaryId => {
      dispatch(homeworkDiarySelected(diaryId));
    },
  };
};

export interface HomeworkSelectScreenNavigationParams {}

class HomeworkSelectScreenContainer extends React.PureComponent<HomeworkSelectScreenProps, object> {
  render() {
    return <HomeworkSelectScreen {...this.props} />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeworkSelectScreenContainer);
