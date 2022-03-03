import I18n from 'i18n-js';
import * as React from 'react';
import { RefreshControl, View } from 'react-native';

import theme from '~/app/theme';
import Explorer from '~/framework/components/explorer';
import { PageView } from '~/framework/components/page';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { openUrl } from '~/framework/util/linking';
import { IUserSession } from '~/framework/util/session';
import { Trackers } from '~/framework/util/tracker';
import { getHomeworkWorkflowInformation } from '~/homework/rights';
import { signURISource, transformedSrc } from '~/infra/oauth';
import { Loading } from '~/ui';
import config from '../config';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import EmptySearch from 'ode-images/empty-screen/empty-search.svg';
import { computeRelativePath } from '~/framework/util/navigation';

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
}

export interface IHomeworkExplorerScreenEventProps {
  onRefresh: () => void;
  onSelect: (diaryId: string) => void;
}

export interface IHomeworkExplorerScreenOtherProps {
  navigation?: any;
  session: IUserSession;
}

export type IHomeworkExplorerScreenProps = IHomeworkExplorerScreenDataProps &
  IHomeworkExplorerScreenEventProps &
  IHomeworkExplorerScreenOtherProps;

export class HomeworkExplorerScreen extends React.PureComponent<IHomeworkExplorerScreenProps, object> {
  state = {
    refreshing: false,
  };

  render() {
    const { isFetching, didInvalidate, navigation } = this.props;
    const pageContent = isFetching && didInvalidate ? <Loading /> : this.renderList();

    return (
      <PageView
        navigation={navigation}
        navBarWithBack={{
          title: I18n.t('homework.homeworkExplorerScreen.homeworks'),
        }}>
        {pageContent}
      </PageView>
    );
  }

  onOpenItem(diary) {
    const { navigation, onSelect } = this.props;
    const diaryId = diary?.id;
    onSelect(diaryId);
    navigation.navigate(computeRelativePath(`${config.name}/tasks`, navigation.state), { diary });
    Trackers.trackEvent('Homework', 'SELECT');
  }

  renderEmpty() {
    const { session } = this.props;
    const homeworkWorkflowInformation = getHomeworkWorkflowInformation(session);
    const hasCreateHomeworkResourceRight = homeworkWorkflowInformation && homeworkWorkflowInformation.create;
    return (
      <EmptyScreen
        svgImage={<EmptySearch />}
        title={I18n.t(`homework-diaries-emptyScreenTitle`)}
        text={I18n.t('homework-diaries-emptyScreenText')}
        buttonText={hasCreateHomeworkResourceRight ? I18n.t('homework-createDiary') : undefined}
        buttonAction={() => {
          //TODO: create generic function inside oauth (use in myapps, etc.)
          if (!DEPRECATED_getCurrentPlatform()) {
            console.warn('Must have a platform selected to redirect the user');
            return null;
          }
          const url = `${DEPRECATED_getCurrentPlatform()!.url}/homeworks`;
          openUrl(url);
          Trackers.trackEvent('Homework', 'GO TO', 'Create in Browser');
        }}
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
        color: theme.themeOpenEnt.green,
        ...(thumbnail ? { thumbnail: signURISource(transformedSrc(thumbnail)) } : { icon: 'book-alt' }),
      };
    });

    return (
      <Explorer
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
        ListFooterComponent={<View style={{ paddingBottom: UI_SIZES.bottomInset }} />}
        ListEmptyComponent={this.renderEmpty()}
        contentContainerStyle={{ flexGrow: 1 }}
        keyExtractor={item => item.id}
      />
    );
  }
}

export default HomeworkExplorerScreen;
