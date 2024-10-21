import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { getSession } from '~/framework/modules/auth/reducer';
import { fetchHomeworkDiaryList } from '~/framework/modules/homework/actions/diaryList';
import homeworkDiarySelected from '~/framework/modules/homework/actions/selectedDiary';
import {
  HomeworkSelectScreen,
  HomeworkSelectScreenDataProps,
  HomeworkSelectScreenEventProps,
  HomeworkSelectScreenProps,
} from '~/framework/modules/homework/components/HomeworkSelectScreen';
import { hasPermissionManager, modifyHomeworkEntryResourceRight } from '~/framework/modules/homework/rights';

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
    owner: homeworkDiaryList.data[diaryId].owner,
    shared: homeworkDiaryList.data[diaryId].shared,
    thumbnail: homeworkDiaryList.data[diaryId].thumbnail,
    title: homeworkDiaryList.data[diaryId].title,
  }));
  const diaryListWithCreationRight = flatHomeworkDiaryList.filter(diary =>
    hasPermissionManager(diary, modifyHomeworkEntryResourceRight, session),
  );

  return {
    diaryList: diaryListWithCreationRight,
    didInvalidate: homeworkDiaryList.didInvalidate,
    isFetching: homeworkDiaryList.isFetching,
    session,
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
