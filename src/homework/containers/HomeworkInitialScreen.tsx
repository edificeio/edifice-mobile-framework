import * as React from 'react';
import { connect } from 'react-redux';

import { fetchHomeworkDiaryList } from '~/homework/actions/diaryList';
import HomeworkTaskListScreen from '~/homework/containers/HomeworkTaskListScreen';
import HomeworkExplorerScreen from '~/homework/containers/HomeworkExplorerScreen';
import { HeaderBackAction } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import { Loading } from '~/ui';

const mapStateToProps: (state: any) => any = state => {
  // Extract data from state
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
  }));

  return {
    diaryList: flatHomeworkDiaryList,
    isFetching: homeworkDiaryList.isFetching,
    didInvalidate: homeworkDiaryList.didInvalidate,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return {
    dispatch,
    onFetchHomeworkDiaryList: () => dispatch(fetchHomeworkDiaryList()),
  };
};

class HomeworkInitialScreenContainer extends React.PureComponent<any & { dispatch: any }, object> {
  render() {
    const { diaryList, didInvalidate, isFetching, navigation } = this.props;
    const hasOneDiary = diaryList?.length === 1;

    const navBarInfo = {
      left: <HeaderBackAction navigation={navigation} />,
    }

    return isFetching && didInvalidate ? (
      <PageView navBar={navBarInfo}>
        <Loading />
      </PageView>
    ) : hasOneDiary ? (
      <HomeworkTaskListScreen {...this.props} />
    ) : (
      <HomeworkExplorerScreen {...this.props} />
    );
  }

  componentDidMount() {
    const { onFetchHomeworkDiaryList } = this.props;
    onFetchHomeworkDiaryList();
  }
}

const HomeworkInitialScreenContainerConnected = connect(mapStateToProps, mapDispatchToProps)(HomeworkInitialScreenContainer);
export default HomeworkInitialScreenContainerConnected;
