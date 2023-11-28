import { Module } from '~/framework/util/moduleTool';

import config from './module-config';
import reducer from './reducer';
import { authStorage as storage } from './storage';

module.exports = new Module({ config, reducer, storage });
