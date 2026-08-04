import type { NavigationState, Route, SceneRendererProps } from 'react-native-tab-view';

export interface HomeTabRoute extends Route {
  title: string;
  // number displayed in a badge next to the label.
  badge?: number;
}

export type HomeTopTabBarProps = SceneRendererProps & {
  navigationState: NavigationState<HomeTabRoute>;
};
