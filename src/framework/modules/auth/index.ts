import config from './module-config';
import reducer, { IAuthState } from './reducer';
import { AuthStorageData, storage } from './storage';

import { IModuleConfig, Module } from '~/framework/util/moduleTool';

module.exports = new Module<'auth', IModuleConfig<'auth', IAuthState>, IAuthState, AuthStorageData>({ config, reducer, storage });
