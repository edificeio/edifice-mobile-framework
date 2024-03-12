import { IModuleConfig, Module } from '~/framework/util/moduleTool';

import config from './module-config';
import reducer, { IAuthState } from './reducer';
import { AuthStorageData, storage } from './storage';

module.exports = new Module<'auth', IModuleConfig<'auth', IAuthState>, IAuthState, AuthStorageData>({ config, reducer, storage });
