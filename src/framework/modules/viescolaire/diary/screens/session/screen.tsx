import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';

import { PageView } from '~/framework/components/page';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import DisplaySession from '~/framework/modules/viescolaire/diary/components/DisplaySession';
import { DiaryNavigationParams, diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

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
          session={this.props.route.params.session}
          sessionList={this.props.route.params.sessionList}
        />
      </PageView>
    );
  }
}

export default DiarySessionScreen;