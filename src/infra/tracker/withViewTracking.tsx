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

import * as React from "react";
import hoistNonReactStatics from 'hoist-non-react-statics';

import { Trackers } from ".";
import { NavigationScreenProp, NavigationState } from "react-navigation";

function getDisplayName(WrappedComponent: React.ComponentClass<any>) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function withViewTracking<
  ComponentProps extends { navigation: NavigationScreenProp<NavigationState> },
  ComponentState
>(path: string[] | string | ((props: ComponentProps) => string[] | string) , tracker = Trackers) {

  type PrivateProps = { forwardedRef: React.RefObject<React.Component<ComponentProps, ComponentState>> };
  type AllProps = PrivateProps & ComponentProps;

  const getPathAsArray = (() => {
    if (typeof path === 'string') return path.split('/');
    if (Array.isArray(path)) return path;
    console.warn(`withViewTracking : must give view path as a string or a string[]. ${path} is not valid.`);
    return [];
  });
  return (WrappedComponent: React.ComponentClass<ComponentProps, ComponentState>) => {
    class WithViewTracking extends React.Component<AllProps, ComponentState> {

      focusListener: any;
      constructor(props: AllProps) {
        super(props);
        const { navigation } = this.props;
        this.focusListener = navigation.addListener("didFocus", () => {
          if (typeof path === 'function') {
            path = path(this.props);
          }
          tracker.trackView(getPathAsArray());
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
    (WithViewTracking as React.ComponentClass<AllProps, ComponentState>).displayName = `WithViewTracking(${getDisplayName(WrappedComponent)})`;
    const RefForwardingFactory = (props: AllProps, ref: React.Component<ComponentProps, ComponentState>) => (
      <WithViewTracking {...props} forwardedRef={ref} />
    );
    const RefsForwarded = React.forwardRef<React.Component<ComponentProps, ComponentState>, ComponentProps>(RefForwardingFactory as any);
    hoistNonReactStatics(RefsForwarded, WrappedComponent);
    return RefsForwarded as unknown as typeof WrappedComponent;
  };

}
