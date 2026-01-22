import { IModuleFileManagerConfig } from '~/framework/util/fileHandler/types';

export type DynamicFileManagerConfig = Record<string, IModuleFileManagerConfig | undefined>;

let registry: DynamicFileManagerConfig = {};

export const registerModuleFileManager = (moduleName: string, config?: IModuleFileManagerConfig) => {
  registry[moduleName] = config;
};

export const getFileManagerConfig = () => registry;

export const getModuleFileManagerConfig = (moduleName: string) => registry[moduleName];
