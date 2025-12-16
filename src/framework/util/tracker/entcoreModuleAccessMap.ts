import { AnyModule } from '~/framework/util/moduleTool';

export type EntcoreModuleAccessMap = Record<string, string>;

export const buildEntcoreModuleAccessMap = (modules: AnyModule[]): EntcoreModuleAccessMap => {
  return modules.reduce<EntcoreModuleAccessMap>((acc, module) => {
    const { entcoreTrackingName, name } = module.config;

    if (!entcoreTrackingName) return acc;

    acc[name.toLowerCase()] = entcoreTrackingName;
    return acc;
  }, {});
};
