import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import type { LvsNavigationParams } from '~/framework/modules/connectors/lvs/navigation';
import { IEntcoreApp } from '~/framework/util/moduleTool';

export interface LvsHomeScreenProps {
  session?: ISession;
}

export interface LvsHomeScreenNavParams {
  connector: IEntcoreApp;
}

export interface LvsHomeScreenPrivateProps extends NativeStackScreenProps<LvsNavigationParams, 'home'>, LvsHomeScreenProps {}
