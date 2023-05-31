import { ParamListBase } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export interface ConnectorNavigationParams extends ParamListBase {
  home: ConnectorRedirectScreenNavParams;
}

export interface ConnectorRedirectScreenProps {}

export interface ConnectorRedirectScreenNavParams {
  url: string;
  appUrl?: string;
}

export interface ConnectorRedirectScreenPrivateProps
  extends NativeStackScreenProps<ConnectorNavigationParams, 'home'>,
    ConnectorRedirectScreenProps {
  // @scaffolder add HOC props here
}
