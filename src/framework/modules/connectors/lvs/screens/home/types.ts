import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import type { LvsNavigationParams } from '~/framework/modules/connectors/lvs/navigation';
import { IEntcoreApp } from '~/framework/util/moduleTool';

export interface LvsHomeScreenProps {
  session?: AuthLoggedAccount;
}

export interface LvsHomeScreenNavParams {
  connector: IEntcoreApp;
}

export interface LvsHomeScreenPrivateProps extends NativeStackScreenProps<LvsNavigationParams, 'home'>, LvsHomeScreenProps {}
