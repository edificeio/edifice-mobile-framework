import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';
import ResourcePicker from '~/framework/components/explorer/resource-picker';
import { ISession } from '~/framework/modules/auth/model';
import { moduleColor } from '~/framework/modules/homework/module-config';
import { HomeworkNavigationParams, homeworkRouteNames } from '~/framework/modules/homework/navigation';
import { IHomeworkDiary } from '~/framework/modules/homework/reducers/diaryList';
import { getHomeworkWorkflowInformation } from '~/framework/modules/homework/rights';
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
  session?: ISession;
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

export class HomeworkSelectScreen extends React.PureComponent<HomeworkSelectScreenProps> {
  onPressDiary = (diary: IHomeworkDiary) => {
    const { onSelect, navigation } = this.props;
    onSelect(diary.id);
    navigation.navigate(homeworkRouteNames.homeworkCreate);
    Trackers.trackEvent('Homework', 'SELECT');
  };

  renderEmptyDiaryList = () => {
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
  };

  render() {
    const { diaryList, onRefresh } = this.props;

    return (
      <ResourcePicker
        data={diaryList}
        emptyComponent={this.renderEmptyDiaryList}
        onRefresh={onRefresh}
        onPressItem={this.onPressDiary}
        defaultThumbnail={{ name: 'homework1D', fill: moduleColor.regular, background: moduleColor.pale }}
      />
    );
  }
}

export default HomeworkSelectScreen;
