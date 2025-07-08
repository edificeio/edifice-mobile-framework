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

import ErrorBoundary, { ErrorBoundaryProps, FallbackComponentProps } from 'react-native-error-boundary';

import { EmptyConnectionScreen } from '../empty-screens';

export default function ErrorScreenView({ error, resetError }: FallbackComponentProps) {
  return <EmptyConnectionScreen />;
}

export function withErrorBoundary<T extends ComponentType<any>>(
  WrappedComponent: T,
  errorBoundaryProps: ErrorBoundaryProps,
): ForwardRefExoticComponent<PropsWithoutRef<ComponentProps<T>> & RefAttributes<ComponentRef<T>>> {
  const Wrapped: ComponentType<ComponentProps<T>> = forwardRef<ComponentRef<T>, ComponentProps<T>>((props, ref) => (
    // @ts-expect-error // This is an issue with React about handling of bigint as children node
    <ErrorBoundary {...errorBoundaryProps}>{createElement(WrappedComponent, { ...props, ref })}</ErrorBoundary>
  ));

  // Format for display in DevTools
  const name = WrappedComponent.displayName || WrappedComponent.name || 'Unknown';
  Wrapped.displayName = `withErrorBoundary(${name})`;

  return Wrapped as ForwardRefExoticComponent<PropsWithoutRef<ComponentProps<T>> & RefAttributes<ComponentRef<T>>>;
}
