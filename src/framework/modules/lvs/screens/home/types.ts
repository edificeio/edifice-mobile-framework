import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import { IEntcoreApp } from '~/framework/util/moduleTool';

import type { LvsNavigationParams } from '../../navigation';

export interface LvsHomeScreenProps {
  session?: ISession;
}

export interface LvsHomeScreenNavParams {
  connector: IEntcoreApp;
}

export interface LvsHomeScreenPrivateProps extends NativeStackScreenProps<LvsNavigationParams, 'home'>, LvsHomeScreenProps {
  // @scaffolder add HOC props here
}
