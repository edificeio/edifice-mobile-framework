import * as React from 'react';

import { ModalPromiseContext } from './provider';

import {
  ModalPromiseNavigationParams,
  PendingModalScreenPromise,
  PendingPromiseScreenProps,
  PromiseScreensData,
  PromiseScreensParamList,
  PromiseScreensResolveType,
} from '~/framework/navigation/promise/types.ts';

// Use this in your component to open a modal as a Promise
export const usePromiseNavigate = <RouteName extends keyof PromiseScreensParamList>(screenName: RouteName) => {
  const { showModal } = React.useContext(ModalPromiseContext);
  return (params: PromiseScreensParamList[RouteName], data: PromiseScreensData[RouteName]) =>
    showModal(screenName, params, data) as Promise<PromiseScreensResolveType[RouteName]>;
};

// Use this in your modal to resolve or reject promise
export const useScreenPromise = <T extends unknown, DataType extends unknown>(modalId: string) => {
  const { getPromise } = React.useContext(ModalPromiseContext);
  return getPromise(modalId) as PendingModalScreenPromise<T, DataType>;
};

export const WithScreenPromise =
  <ResolveType, DataType, Props extends { route: { params: ModalPromiseNavigationParams } }>(
    Component: React.ComponentType<Props & PendingPromiseScreenProps<ResolveType, DataType>>,
  ) =>
  (props: Props) => {
    const pendingPromise = useScreenPromise<ResolveType, DataType>(props.route.params.modalId);
    return (
      <Component
        {...props}
        modalPromiseData={pendingPromise.data}
        resolveModalPromise={pendingPromise.resolve}
        rejectModalPromise={pendingPromise.reject}
      />
    );
  };
