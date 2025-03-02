import * as React from 'react';
import { RefreshControl, View } from 'react-native';

import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/empty-screens';
import ResourceExplorer from '~/framework/components/explorer/resource-explorer';
import { PageView } from '~/framework/components/page';
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import config from '~/framework/modules/homework/module-config';
import { HomeworkNavigationParams, homeworkRouteNames } from '~/framework/modules/homework/navigation';
import { getHomeworkWorkflowInformation } from '~/framework/modules/homework/rights';
import { navBarOptions } from '~/framework/navigation/navBar';
import appConf from '~/framework/util/appConf';
import { formatSource } from '~/framework/util/media';
import { Trackers } from '~/framework/util/tracker';
import { Loading } from '~/ui/Loading';

export interface IHomeworkExplorerScreenDataProps {
  diaryList?: {
    id: string;
    title: string;
    name: string;
    thumbnail: string;
  }[];
  selectedDiaryId?: string;
  didInvalidate?: boolean;
  isFetching?: boolean;
  session?: AuthLoggedAccount;
}

export interface IHomeworkExplorerScreenEventProps {
  onRefresh: () => void;
  onSelect: (diaryId: string) => void;
  dispatch: ThunkDispatch<any, any, any>;
}

export interface IHomeworkExplorerScreenOtherProps
  extends NativeStackScreenProps<HomeworkNavigationParams, typeof homeworkRouteNames.homeworkExplorer> {}

export type IHomeworkExplorerScreenProps = IHomeworkExplorerScreenDataProps &
  IHomeworkExplorerScreenEventProps &
  IHomeworkExplorerScreenOtherProps;

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<HomeworkNavigationParams, typeof homeworkRouteNames.homeworkExplorer>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('homework-explorer-homeworks'),
  }),
});

export class HomeworkExplorerScreen extends React.PureComponent<IHomeworkExplorerScreenProps, object> {
  state = {
    refreshing: false,
  };

  render() {
    const { didInvalidate, isFetching } = this.props;
    const pageContent = isFetching && didInvalidate ? <Loading /> : this.renderList();

    return <PageView>{pageContent}</PageView>;
  }

  onOpenItem(diary) {
    const { navigation, onSelect } = this.props;
    const diaryId = diary?.id;
    onSelect(diaryId);
    navigation.navigate(homeworkRouteNames.homeworkTaskList, { diary });
    Trackers.trackEvent('Homework', 'SELECT');
  }

  renderEmpty() {
    const { session } = this.props;
    const homeworkWorkflowInformation = session && getHomeworkWorkflowInformation(session);
    const hasCreateHomeworkResourceRight = homeworkWorkflowInformation && homeworkWorkflowInformation.create;
    return (
      <EmptyScreen
        svgImage="empty-search"
        title={I18n.get('homework-explorer-emptyscreen-title')}
        text={I18n.get('homework-explorer-emptyscreen-text')}
        buttonText={hasCreateHomeworkResourceRight ? I18n.get('homework-explorer-creatediary') : undefined}
        buttonUrl="/homeworks"
        buttonAction={() => Trackers.trackEvent('Homework', 'GO TO', 'Create in Browser')}
      />
    );
  }

  renderList() {
    const { diaryList, onRefresh } = this.props;
    const { refreshing } = this.state;
    const displayedDiaries = diaryList?.map(bb => {
      const { thumbnail, ...b } = bb;
      return {
        ...b,
        color: theme.palette.complementary[appConf.is1d ? 'blue' : 'green'].regular,
        icon: config.displayPicture,
        ...(thumbnail && { thumbnail: formatSource(thumbnail) }),
      };
    });

    return (
      <ResourceExplorer
        resources={displayedDiaries}
        onItemPress={diary => this.onOpenItem(diary)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              this.setState({ refreshing: true });
              await onRefresh();
              this.setState({ refreshing: false });
            }}
          />
        }
        ListFooterComponent={<View style={{ paddingBottom: UI_SIZES.screen.bottomInset }} />}
        ListEmptyComponent={this.renderEmpty()}
        keyExtractor={item => item.id}
      />
    );
  }

  componentDidMount(): void {
    this.props.navigation.setOptions(computeNavBar(this.props));
  }
}

export default HomeworkExplorerScreen;
