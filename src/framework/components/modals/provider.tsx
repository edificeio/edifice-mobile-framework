/**
 * Modal Promise Provider
 * Make modals available as Promises.
 *
 * Usage :
 * -
 */

import * as React from 'react';

import { NavigationProp, useNavigation } from '@react-navigation/native';

import type { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';

interface PendingPromise<T, DataType> {
  data: DataType;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

interface PendingPromiseScreenProps<T, DataType> {
  modalPromiseData: PendingPromise<T, DataType>['data'];
  resolveModalPromise: PendingPromise<T, DataType>['resolve'];
  rejectModalPromise: PendingPromise<T, DataType>['reject'];
}

const errorNotInitialized = () =>
  console.error(
    'ModalPromiseContext was not initialized. Be sure that you included the <ModalPromiseProvider> in your component tree, inside the Navigation Container.',
  );

const ModalPromiseContext = React.createContext<{
  showModal: <RouteName extends ModalsRouteNames>(
    screenName: RouteName,
    params: IModalsNavigationParams[RouteName],
    data: any,
  ) => Promise<any>;
  getPromise: (modalId: string) => PendingPromise<any, any>;
}>({
  getPromise: () => ({
    data: undefined,
    reject: errorNotInitialized,
    resolve: errorNotInitialized,
  }),
  showModal: async () => {
    return errorNotInitialized();
  },
});

export const ModalPromiseProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const navigation = useNavigation<NavigationProp<IModalsNavigationParams, ModalsRouteNames>>();
  const pendingPromises = React.useRef(new Map<string, PendingPromise<any, any>>());
  const getPromise = React.useCallback((modalId: string) => {
    const pendingPromise = pendingPromises.current.get(modalId);
    if (!pendingPromise) {
      throw new Error(`ModalPromiseProvider : no existing modal with id "${modalId}"`);
    }
    return {
      data: pendingPromise.data,
      reject: (error: any) => {
        pendingPromise.reject(error);
        pendingPromises.current.delete(modalId);
      },
      resolve: (value: any) => {
        pendingPromise.resolve(value);
        pendingPromises.current.delete(modalId);
      },
    };
  }, []);

  const showModal = React.useCallback(
    <RouteName extends ModalsRouteNames>(
      screenName: ModalsRouteNames,
      navParams: IModalsNavigationParams[RouteName],
      data: any,
    ): Promise<any> => {
      const modalId = `${screenName}|${Math.random()}`;
      return new Promise<any>((resolve, reject) => {
        pendingPromises.current.set(modalId, { data, reject, resolve });
        navigation.navigate(screenName, { ...navParams, modalId });
      });
    },
    [navigation, pendingPromises],
  );

  return <ModalPromiseContext.Provider value={{ getPromise, showModal }}>{children}</ModalPromiseContext.Provider>;
};

// Use this in your component to open a modal as a Promise
export const useOpenModal = <T extends unknown, RouteName extends ModalsRouteNames, DataType extends unknown>(
  screenName: RouteName,
) => {
  const { showModal } = React.useContext(ModalPromiseContext);
  return (params: IModalsNavigationParams[RouteName], data: DataType) => showModal(screenName, params, data) as Promise<T>;
};

// Use this in your modal to resolve or reject promise
export const useModalPromise = <T extends unknown, DataType extends unknown>(modalId: string) => {
  const { getPromise } = React.useContext(ModalPromiseContext);
  return getPromise(modalId) as PendingPromise<T, DataType>;
};

export interface ModalPromiseNavigationParams {
  modalId: string;
}

export const WithModalPromise =
  <T, DataType, P extends { route: { params: ModalPromiseNavigationParams } }>(
    Component: React.ComponentType<P & PendingPromiseScreenProps<T, DataType>>,
  ) =>
  (props: P) => {
    const pendingPromise = useModalPromise<T, DataType>(props.route.params.modalId);
    return (
      <Component
        {...props}
        modalPromiseData={pendingPromise.data}
        resolveModalPromise={pendingPromise.resolve}
        rejectModalPromise={pendingPromise.reject}
      />
    );
  };
