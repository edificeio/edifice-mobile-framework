/**
 * withViewTracking
 * HOC that defines a view that will be tracked.
 * Uses React Navigation didFocus listener to track view display.
 *
 * Usage :
 * withViewTracking(['view', 'subview'])(Component); // will use the default tracker
 * withViewTracking('view/subview')(Component); // Alternate form
 * withViewTracking(['view', 'subview'], myCustomTracker)(Component); // Pass a custom tracker that implement Tracker interface
 */
// Typings from https://medium.com/@martin_hotell/react-refs-with-typescript-a32d56c4d315
import hoistNonReactStatics from 'hoist-non-react-statics';
import * as React from 'react';
import { NavigationInjectedProps, NavigationRouteConfig, NavigationRouteConfigMap, NavigationScreenProp, NavigationState } from 'react-navigation';



import { Trackers } from '.';


function getDisplayName(WrappedComponent: React.ComponentType<any>) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function withViewTracking<
  ComponentProps extends NavigationInjectedProps,
  ComponentState,
>(path: string[] | string | ((props: ComponentProps) => string[] | string), tracker = Trackers) {
  type PrivateProps = { forwardedRef: React.RefObject<React.Component<ComponentProps, ComponentState>> };
  type AllProps = PrivateProps & ComponentProps;

  const getPathAsArray = (resolvedPath: string[] | string) => {
    if (typeof resolvedPath === 'string') return resolvedPath.split('/');
    if (Array.isArray(resolvedPath)) return resolvedPath;
    console.warn(`withViewTracking : must give view path as a string or a string[]. ${resolvedPath} is not valid.`);
    return [];
  };
  return (WrappedComponent: React.ComponentType<ComponentProps>) => {
    class WithViewTracking extends React.Component<AllProps, ComponentState> {
      focusListener: any;
      constructor(props: AllProps) {
        super(props);
        const { navigation } = this.props;
        this.focusListener = navigation.addListener('didFocus', () => {
          const resolvedPath = typeof path === 'function' ? path(this.props) : path;
          resolvedPath && tracker.trackView(getPathAsArray(resolvedPath));
        });
      }

      componentWillUnmount() {
        this.focusListener.remove();
      }

      render() {
        const { forwardedRef, ...tmpRestProps } = this.props as PrivateProps;
        const restProps = tmpRestProps as ComponentProps;
        return <WrappedComponent {...restProps} />;
      }
    }
    (
      WithViewTracking as unknown as React.ComponentType<ComponentProps & NavigationInjectedProps>
    ).displayName = `WithViewTracking(${getDisplayName(WrappedComponent)})`;
    const RefForwardingFactory = (props: AllProps, ref: React.Component<ComponentProps, ComponentState>) => (
      <WithViewTracking {...props} forwardedRef={ref} />
    );
    const RefsForwarded = React.forwardRef<React.Component<ComponentProps, ComponentState>, ComponentProps>(
      RefForwardingFactory as any,
    );
    hoistNonReactStatics(RefsForwarded, WrappedComponent);
    return RefsForwarded as unknown as typeof WrappedComponent;
  };
}

export const addViewTrackingToStackRoutes = (routeConfigMap: {
  [routeName: string]: NavigationRouteConfig<any, any> & {
    screen: React.ComponentType<NavigationInjectedProps>;
  };
}) => {
  const ret = {};
  for (const routeName in routeConfigMap) {
    ret[routeName] = {
      ...routeConfigMap[routeName],
      screen: withViewTracking(routeName)(routeConfigMap[routeName].screen),
    };
  }
  return ret as NavigationRouteConfigMap<any, any>;
};