import I18n from 'i18n-js';
import * as React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';

import { getUserSession } from '~/framework/util/session';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { fetchHomeworkDiaryList, fetchHomeworkDiaryListIfNeeded } from '~/homework/actions/diaryList';
import { homeworkDiarySelected } from '~/homework/actions/selectedDiary';
import {
  HomeworkFilterPage,
  IHomeworkFilterPageDataProps,
  IHomeworkFilterPageEventProps,
  IHomeworkFilterPageProps,
} from '~/homework/components/HomeworkFilterPage';
import { alternativeNavScreenOptions } from '~/navigation/helpers/navScreenOptions';
import { HeaderBackAction } from '~/ui/headers/NewHeader';

const mapStateToProps: (state: any) => IHomeworkFilterPageDataProps = state => {
  // Extract data from state
  const session = getUserSession(state);
  const localState = state.homework;
  const homeworkDiaryList = localState.diaryList;
  if (!homeworkDiaryList.data)
    return {
      diaryList: [],
      isFetching: homeworkDiaryList.isFetching,
      selectedDiaryId: localState.selected,
      session,
    };
  const flatHomeworkDiaryList = Object.getOwnPropertyNames(homeworkDiaryList.data).map(diaryId => ({
    id: diaryId,
    name: homeworkDiaryList.data[diaryId].name,
    title: homeworkDiaryList.data[diaryId].title,
  }));
  const { didInvalidate, isFetching } = homeworkDiaryList;

  // Format props
  return {
    diaryList: flatHomeworkDiaryList,
    didInvalidate,
    isFetching,
    selectedDiaryId: localState.selectedDiary,
    session,
  };
};

const mapDispatchToProps: (dispatch: any) => IHomeworkFilterPageEventProps = dispatch => {
  return {
    dispatch,
    onRefresh: () => dispatch(fetchHomeworkDiaryList()),
    onSelect: (diaryId, trackingKeyword) => {
      dispatch(homeworkDiarySelected(diaryId));
    },
  };
};

class HomeworkFilterPageContainer extends React.PureComponent<IHomeworkFilterPageProps & { dispatch: any }, object> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return alternativeNavScreenOptions(
      {
        title: I18n.t('homework-select'),
        headerLeft: <HeaderBackAction navigation={navigation} />,
      },
      navigation,
    );
  };

  constructor(props) {
    super(props);
  }

  public render() {
    return <HomeworkFilterPage {...this.props} />;
  }

  public componentDidMount() {
    this.props.dispatch(fetchHomeworkDiaryListIfNeeded());
  }
}

const HomeworkFilterPageContainerConnected = connect(mapStateToProps, mapDispatchToProps)(HomeworkFilterPageContainer);

export default withViewTracking('homework/filter')(HomeworkFilterPageContainerConnected);
