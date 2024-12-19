import * as React from 'react';

import { connect } from 'react-redux';

import { getSession } from '~/framework/modules/auth/reducer';
import { fetchHomeworkDiaryList } from '~/framework/modules/homework/actions/diaryList';
import homeworkDiarySelected from '~/framework/modules/homework/actions/selectedDiary';
import {
  HomeworkExplorerScreen,
  IHomeworkExplorerScreenDataProps,
  IHomeworkExplorerScreenEventProps,
  IHomeworkExplorerScreenProps,
} from '~/framework/modules/homework/components/HomeworkExplorerScreen';

const mapStateToProps: (state: any) => IHomeworkExplorerScreenDataProps = state => {
  // Extract data from state
  const session = getSession();
  const localState = state.homework;
  const homeworkDiaryList = localState.diaryList;
  if (!homeworkDiaryList.data)
    return {
      diaryList: [],
      isFetching: homeworkDiaryList.isFetching,
      selectedDiaryId: localState.selected,
      session,
    };
  const { didInvalidate, isFetching } = homeworkDiaryList;

  // Format props
  return {
    didInvalidate,
    isFetching,
    selectedDiaryId: localState.selectedDiary,
    session,
  };
};

const mapDispatchToProps: (dispatch: any) => IHomeworkExplorerScreenEventProps = dispatch => {
  return {
    dispatch,
    onRefresh: () => dispatch(fetchHomeworkDiaryList()),
    onSelect: diaryId => {
      dispatch(homeworkDiarySelected(diaryId));
    },
  };
};

export interface HomeworkExplorerScreenNavigationParams {}

class HomeworkExplorerScreenContainer extends React.PureComponent<IHomeworkExplorerScreenProps & { dispatch: any }, object> {
  render() {
    return <HomeworkExplorerScreen {...this.props} />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeworkExplorerScreenContainer);
