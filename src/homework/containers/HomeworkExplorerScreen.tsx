import * as React from 'react';
import { connect } from 'react-redux';

import { getUserSession } from '~/framework/util/session';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { fetchHomeworkDiaryList } from '~/homework/actions/diaryList';
import homeworkDiarySelected from '~/homework/actions/selectedDiary';
import {
  HomeworkExplorerScreen,
  IHomeworkExplorerScreenDataProps,
  IHomeworkExplorerScreenEventProps,
  IHomeworkExplorerScreenProps,
} from '~/homework/components/HomeworkExplorerScreen';
import config from '~/homework/config';

const mapStateToProps: (state: any) => IHomeworkExplorerScreenDataProps = state => {
  // Extract data from state
  const session = getUserSession();
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

class HomeworkExplorerScreenContainer extends React.PureComponent<IHomeworkExplorerScreenProps & { dispatch: any }, object> {
  render() {
    return <HomeworkExplorerScreen {...this.props} />;
  }
}

const HomeworkExplorerScreenContainerConnected = connect(mapStateToProps, mapDispatchToProps)(HomeworkExplorerScreenContainer);

export default withViewTracking(`${config.name}`)(HomeworkExplorerScreenContainerConnected);
