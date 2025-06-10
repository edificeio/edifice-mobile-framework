import { ParamListBase } from '@react-navigation/native';

export interface PendingModalScreenPromise<T, DataType> {
  data: DataType;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
}

export interface PromiseScreensParamList extends ParamListBase {
  // extend this interface to add screen props
}

export interface PromiseScreensData extends ParamListBase {
  // extend this interface to add promise data
}

export interface PromiseScreensResolveType extends Record<string, unknown> {
  // extend this interface to add promise data
}
export interface ModalPromiseNavigationParams {
  modalId: string;
}

export interface PendingPromiseScreenProps<T, DataType> {
  modalPromiseData: PendingModalScreenPromise<T, DataType>['data'];
  resolveModalPromise: PendingModalScreenPromise<T, DataType>['resolve'];
  rejectModalPromise: PendingModalScreenPromise<T, DataType>['reject'];
}
