import * as React from 'react';
import { Platform } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import { fetchHomeworkDiaryList } from '~/homework/actions/diaryList';
import HomeworkTaskListScreen from '~/homework/containers/HomeworkTaskListScreen';
import HomeworkExplorerScreen from '~/homework/containers/HomeworkExplorerScreen';
import { FakeHeader_Container, HeaderAction, HeaderLeft, FakeHeader_Row } from '~/framework/components/header';
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
    return isFetching && didInvalidate ? (
      <>
        <FakeHeader_Container>
          <FakeHeader_Row>
            <HeaderLeft>
              <HeaderAction
                iconName={Platform.OS === 'ios' ? 'chevron-left1' : 'back'}
                iconSize={24}
                onPress={() => navigation.dispatch(NavigationActions.back())}
              />
            </HeaderLeft>
          </FakeHeader_Row>
        </FakeHeader_Container>
        <PageView>
          <Loading />
        </PageView>
      </>
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
