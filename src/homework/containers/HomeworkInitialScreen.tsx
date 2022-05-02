import * as React from 'react';
import { connect } from 'react-redux';

import { PageView } from '~/framework/components/page';
import { fetchHomeworkDiaryList } from '~/homework/actions/diaryList';
import HomeworkExplorerScreen from '~/homework/containers/HomeworkExplorerScreen';
import HomeworkTaskListScreen from '~/homework/containers/HomeworkTaskListScreen';
import { Loading } from '~/ui/Loading';

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

export interface IHomeworkInitialScreenState {
  isPristine: boolean;
}

class HomeworkInitialScreenContainer extends React.PureComponent<any & { dispatch: any }, IHomeworkInitialScreenState> {
  state = {
    isPristine: true,
  };

  render() {
    const { isPristine } = this.state;
    const { diaryList, isFetching, navigation } = this.props;
    const hasOneDiary = diaryList?.length === 1;

    return isPristine || isFetching ? (
      <PageView navigation={navigation} navBarWithBack={{}}>
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
    this.setState({ isPristine: false });
    onFetchHomeworkDiaryList();
  }
}

const HomeworkInitialScreenContainerConnected = connect(mapStateToProps, mapDispatchToProps)(HomeworkInitialScreenContainer);
export default HomeworkInitialScreenContainerConnected;
