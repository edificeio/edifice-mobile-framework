import React from 'react';

import EntAppImage from '~/framework/components/picture/ent-app-image';
import { useModuleAppName } from '~/modules/myapps/hooks';

import { ModuleImageProps } from './types';

/**
 * An image of a resource of a module of the app: `EntAppImage` with the app of the module (its `matchEntcoreApp`).
 * For a module known by the code (given directly); for the name of an app that comes from the server, use `EntAppImage`.
 */
const ModuleImage: React.FC<ModuleImageProps> = ({ moduleName, ...props }) => {
  const entAppName = useModuleAppName(moduleName);
  return <EntAppImage {...props} entAppName={entAppName} />;
};

export default ModuleImage;
