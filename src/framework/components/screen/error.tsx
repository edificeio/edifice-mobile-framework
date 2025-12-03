import React, {
  ComponentProps,
  ComponentRef,
  ComponentType,
  createElement,
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from 'react';

import { useNavigation } from '@react-navigation/native';
import ErrorBoundary, { ErrorBoundaryProps, FallbackComponentProps } from 'react-native-error-boundary';

import EmptyErrorScreen from '../empty-screens/error/component';

export default function ErrorScreenView({ resetError }: FallbackComponentProps) {
  const navigation = useNavigation();
  const onRetry = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      resetError();
    }
  }, [navigation, resetError]);
  return <EmptyErrorScreen onRetry={onRetry} />;
}

export function withErrorBoundary<T extends ComponentType<any>>(
  WrappedComponent: T,
  errorBoundaryProps: ErrorBoundaryProps,
): ForwardRefExoticComponent<PropsWithoutRef<ComponentProps<T>> & RefAttributes<ComponentRef<T>>> {
  const Wrapped: ComponentType<ComponentProps<T>> = forwardRef<ComponentRef<T>, ComponentProps<T>>((props, ref) => (
    <ErrorBoundary {...errorBoundaryProps}>{createElement(WrappedComponent, { ...props, ref })}</ErrorBoundary>
  ));

  // Format for display in DevTools
  const name = WrappedComponent.displayName || WrappedComponent.name || 'Unknown';
  Wrapped.displayName = `withErrorBoundary(${name})`;

  return Wrapped as ForwardRefExoticComponent<PropsWithoutRef<ComponentProps<T>> & RefAttributes<ComponentRef<T>>>;
}
