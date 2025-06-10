/**
 * Modal Promise Provider
 * Make modals available as Promises.
 *
 * Usage :
 * -
 */

import * as React from 'react';

import { NavigationProp, useNavigation } from '@react-navigation/native';

import { PendingModalScreenPromise, PromiseScreensData, PromiseScreensParamList } from './types';

const errorNotInitialized = () =>
  console.error(
    'ModalPromiseContext was not initialized. Be sure that you included the <ModalPromiseProvider> in your component tree, inside the Navigation Container.',
  );

export const ModalPromiseContext = React.createContext<{
  showModal: <RouteName extends keyof PromiseScreensParamList>(
    screenName: RouteName,
    params: PromiseScreensParamList[RouteName],
    data: any,
  ) => Promise<any>;
  getPromise: (modalId: string) => PendingModalScreenPromise<any, any>;
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
  const navigation = useNavigation<NavigationProp<PromiseScreensParamList, keyof PromiseScreensParamList>>();
  const pendingPromises = React.useRef(new Map<string, PendingModalScreenPromise<any, any>>());
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
    <RouteName extends keyof PromiseScreensParamList>(
      screenName: RouteName,
      navParams: PromiseScreensParamList[RouteName],
      data: PromiseScreensData[RouteName],
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
