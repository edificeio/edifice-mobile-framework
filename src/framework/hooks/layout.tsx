import React from 'react';
import { View } from 'react-native';

export interface Layout {
  width: number;
  height: number;
  x: number;
  y: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
}

/**
 * Measures and returns layout information about the given Element.
 * @param elementRef A ref to the element to be measured.
 * @param deps Dependency list for useLayoutEffect.
 * @returns layout information. Can be undefined if ref is missing or unintialised.
 */
export function useLayout(elementRef: React.RefObject<View | null>, deps: React.DependencyList = []) {
  const [layout, setLayout] = React.useState<Layout | undefined>(undefined);
  React.useLayoutEffect(function measureLayout() {
    setLayout(elementRef.current?.getBoundingClientRect());
    // Note :
    //   `elementRef` dependency is not needed because it's a Ref (same object across re)renders
    //   The real dependency list is up to the developer for retrigger the layout effect as needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return layout;
}
