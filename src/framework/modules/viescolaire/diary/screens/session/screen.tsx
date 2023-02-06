import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';

import { PageView } from '~/framework/components/page';
import DisplaySession from '~/framework/modules/viescolaire/diary/components/DisplaySession';
import { DiaryNavigationParams, diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<DiaryNavigationParams, typeof diaryRouteNames.session>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('Homework'),
  headerStyle: {
    backgroundColor: viescoTheme.palette.diary,
  },
});

class DiarySessionScreen extends React.PureComponent<any> {
  public render() {
    return (
      <PageView>
        <DisplaySession
          {...this.props}
          session={this.props.navigation.state.params.session}
          sessionList={this.props.navigation.state.params.sessionList}
        />
      </PageView>
    );
  }
}

export default DiarySessionScreen;
