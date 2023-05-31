import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import { fetchHomeworkDiaryList } from '~/framework/modules/homework/actions/diaryList';
import { IHomeworkExplorerScreenDataProps } from '~/framework/modules/homework/components/HomeworkExplorerScreen';
import HomeworkExplorerScreen from '~/framework/modules/homework/screens/HomeworkExplorerScreen';
import HomeworkTaskListScreen from '~/framework/modules/homework/screens/HomeworkTaskListScreen';
import { Loading } from '~/ui/Loading';

const mapStateToProps: (state: IGlobalState) => HomeworkInitialScreenDataProps = (state: IGlobalState) => {
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

const mapDispatchToProps = (dispatch: any) => {
  return {
    dispatch,
    onFetchHomeworkDiaryList: () => dispatch(fetchHomeworkDiaryList()),
  };
};

export type HomeworkInitialScreenNavigationParams = undefined;

export interface HomeworkInitialScreenDataProps {
  diaryList?: IHomeworkExplorerScreenDataProps['diaryList'];
  isFetching?: IHomeworkExplorerScreenDataProps['isFetching'];
  didInvalidate?: IHomeworkExplorerScreenDataProps['didInvalidate'];
}

export interface HomeworkInitialScreenEventProps {
  dispatch: ThunkDispatch<any, any, any>;
  onFetchHomeworkDiaryList: () => void;
}

export type HomeworkInitialScreenProps = HomeworkInitialScreenDataProps &
  HomeworkInitialScreenEventProps & { navigation: any; route: any };

export interface IHomeworkInitialScreenState {
  isPristine: boolean;
}

class HomeworkInitialScreenContainer extends React.PureComponent<HomeworkInitialScreenProps, IHomeworkInitialScreenState> {
  state = {
    isPristine: true,
  };

  render() {
    const { isPristine } = this.state;
    const { diaryList, isFetching } = this.props;
    const hasOneDiary = diaryList?.length === 1;

    return isPristine || isFetching ? (
      <PageView>
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

export default connect(mapStateToProps, mapDispatchToProps)(HomeworkInitialScreenContainer);
