import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';
import ResourcePicker from '~/framework/components/explorer/resource-picker';
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { HomeworkNavigationParams, homeworkRouteNames } from '~/framework/modules/homework/navigation';
import { IHomeworkDiary } from '~/framework/modules/homework/reducers/diaryList';
import { getHomeworkWorkflowInformation } from '~/framework/modules/homework/rights';
import { useAppTheme } from '~/framework/modules/myapps/hooks';
import { navBarOptions } from '~/framework/navigation/navBar';
import { Trackers } from '~/framework/util/tracker';

export interface HomeworkSelectScreenDataProps {
  diaryList: {
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
  session?: AuthLoggedAccount;
}
export interface HomeworkSelectScreenEventProps {
  onRefresh: () => Promise<void>;
  onSelect: (diaryId: string) => void;
  dispatch: ThunkDispatch<any, any, any>;
}
export type HomeworkSelectScreenProps = HomeworkSelectScreenDataProps &
  HomeworkSelectScreenEventProps &
  NativeStackScreenProps<HomeworkNavigationParams, typeof homeworkRouteNames.homeworkSelect>;

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

function HomeworkSelectScreenComponent(props: HomeworkSelectScreenProps) {
  const appTheme = useAppTheme('homework');
  const { diaryList, navigation, onRefresh, onSelect, session } = props;

  const onPressDiary = (diary: IHomeworkDiary) => {
    onSelect(diary.id);
    navigation.navigate(homeworkRouteNames.homeworkCreate, {});
    Trackers.trackEvent('Homework', 'SELECT');
  };

  const renderEmptyDiaryList = () => {
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
  };

  return (
    <ResourcePicker
      data={diaryList}
      emptyComponent={renderEmptyDiaryList}
      onRefresh={onRefresh}
      onPressItem={onPressDiary}
      defaultThumbnail={{
        background: appTheme.colors.pale,
        fill: appTheme.colors.regular,
        name: 'homework1D',
      }}
    />
  );
}

export const HomeworkSelectScreen = React.memo(HomeworkSelectScreenComponent);

export default HomeworkSelectScreen;
