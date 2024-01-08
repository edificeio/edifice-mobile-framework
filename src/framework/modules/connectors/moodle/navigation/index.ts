import { ParamListBase } from '@react-navigation/native';

import type { ConnectorRedirectScreenNavParams } from '~/framework/modules/connectors/common/redirect-screen';
import moduleConfig from '~/framework/modules/connectors/moodle/module-config';

export const moodleRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface MoodleNavigationParams extends ParamListBase {
  home: ConnectorRedirectScreenNavParams;
}
