import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen } from '~/framework/components/emptyConnectionScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { ListItem } from '~/framework/components/listItem';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyBoldText, SmallText } from '~/framework/components/text';
import { navBarOptions } from '~/framework/navigation/navBar';
import { Image } from '~/framework/util/media';
import { Trackers } from '~/framework/util/tracker';

import { ISession } from '../../auth/model';
import { HomeworkNavigationParams, homeworkRouteNames } from '../navigation';
import { IHomeworkDiary } from '../reducers/diaryList';
import { getHomeworkWorkflowInformation } from '../rights';

export interface HomeworkSelectScreenDataProps {
  diaryList?: {
    id: string;
    title: string;
    name: string;
    thumbnail: string;
    shared?: ({
      [key: string]: boolean | string | undefined;
    } & {
      [key in 'userId' | 'groupId']: string;
    })[];
  }[];
  didInvalidate?: boolean;
  isFetching?: boolean;
  session?: ISession;
}
export interface HomeworkSelectScreenEventProps {
  onRefresh: () => void;
  onSelect: (diaryId: string) => void;
  dispatch: ThunkDispatch<any, any, any>;
}
export type HomeworkSelectScreenProps = HomeworkSelectScreenDataProps &
  HomeworkSelectScreenEventProps &
  NativeStackScreenProps<HomeworkNavigationParams, typeof homeworkRouteNames.homeworkSelect>;

export enum HomeworkSelectLoadingState {
  PRISTINE,
  INIT,
  REFRESH,
  DONE,
}
export interface HomeworkSelectScreenState {
  loadingState: HomeworkSelectLoadingState;
  errorState: boolean;
}

const styles = StyleSheet.create({
  diaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  diaryItemImage: {
    width: UI_SIZES.elements.avatar.lg,
    aspectRatio: UI_SIZES.aspectRatios.square,
    borderRadius: UI_SIZES.radius.medium,
  },
  diaryItemNoImage: {
    backgroundColor: theme.palette.complementary.green.pale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diaryItemTexts: {
    flex: 1,
    marginLeft: UI_SIZES.spacing.small,
  },
  diaryList: {
    flexGrow: 1,
  },
});

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<HomeworkNavigationParams, typeof homeworkRouteNames.homeworkSelect>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('homework-select-title'),
  }),
});

export class HomeworkSelectScreen extends React.PureComponent<HomeworkSelectScreenProps, HomeworkSelectScreenState> {
  state: HomeworkSelectScreenState = {
    loadingState: HomeworkSelectLoadingState.PRISTINE,
    errorState: false,
  };

  async doRefresh() {
    const { onRefresh } = this.props;
    try {
      this.setState({ loadingState: HomeworkSelectLoadingState.REFRESH });
      await onRefresh();
    } catch {
      this.setState({ errorState: true });
    } finally {
      this.setState({ loadingState: HomeworkSelectLoadingState.DONE });
    }
  }

  renderError() {
    return <EmptyConnectionScreen />;
  }

  renderList() {
    const { diaryList } = this.props;
    const { loadingState } = this.state;
    const isEmpty = diaryList?.length === 0;
    return (
      <FlatList
        data={diaryList}
        renderItem={({ item }: { item: IHomeworkDiary }) => this.renderDiary(item)}
        keyExtractor={(item: IHomeworkDiary) => item.id.toString()}
        contentContainerStyle={[styles.diaryList, { paddingBottom: isEmpty ? undefined : UI_SIZES.screen.bottomInset }]}
        ListEmptyComponent={this.renderEmpty()}
        refreshControl={
          <RefreshControl
            refreshing={[HomeworkSelectLoadingState.REFRESH, HomeworkSelectLoadingState.INIT].includes(loadingState)}
            onRefresh={() => this.doRefresh()}
          />
        }
      />
    );
  }

  renderEmpty() {
    const { session } = this.props;
    const homeworkWorkflowInformation = session && getHomeworkWorkflowInformation(session);
    const hasCreateHomeworkResourceRight = homeworkWorkflowInformation && homeworkWorkflowInformation.create;
    return (
      <EmptyScreen
        svgImage="empty-search"
        title={I18n.get('homework-select-emptyscreen-title')}
        text={I18n.get('homework-select-emptyscreen-text')}
        buttonText={hasCreateHomeworkResourceRight ? I18n.get('homework-select-creatediary') : undefined}
        buttonUrl="/homeworks"
        buttonAction={() => Trackers.trackEvent('Homework', 'GO TO', 'Create in Browser')}
      />
    );
  }

  renderDiary(diary: IHomeworkDiary) {
    const { navigation, onSelect } = this.props;
    const diaryShareNumber = diary.shared?.length;
    return (
      <TouchableOpacity
        onPress={() => {
          onSelect(diary.id);
          navigation.navigate(homeworkRouteNames.homeworkCreate);
          Trackers.trackEvent('Homework', 'SELECT');
        }}>
        <ListItem
          leftElement={
            <View style={styles.diaryItem}>
              {diary.thumbnail ? (
                <Image source={{ uri: diary.thumbnail }} style={styles.diaryItemImage} />
              ) : (
                <View style={[styles.diaryItemImage, styles.diaryItemNoImage]}>
                  <NamedSVG name="homework1D" fill={theme.palette.complementary.green.regular} width={32} height={32} />
                </View>
              )}
              <View style={styles.diaryItemTexts}>
                <BodyBoldText numberOfLines={1}>{diary.title}</BodyBoldText>
                <SmallText>
                  {I18n.get(`homework-select-sharedtonbperson${diaryShareNumber === 1 ? '' : 's'}`, {
                    nb: diaryShareNumber || 0,
                  })}
                </SmallText>
              </View>
            </View>
          }
          rightElement={
            <NamedSVG
              name="ui-rafterRight"
              fill={theme.palette.primary.regular}
              width={UI_SIZES.elements.icon.small}
              height={UI_SIZES.elements.icon.small}
            />
          }
        />
      </TouchableOpacity>
    );
  }

  render() {
    const { errorState } = this.state;
    return <PageView>{errorState ? this.renderError() : this.renderList()}</PageView>;
  }
}

export default HomeworkSelectScreen;
