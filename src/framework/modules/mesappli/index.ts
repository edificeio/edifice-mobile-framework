import { Action } from 'redux';

import './init';
import config from './module-config';
import reducer from './reducer/reducer';
import { AppsInfoState } from './types';

import { Module } from '~/framework/util/moduleTool';

module.exports = new Module<'mesappli', typeof config, AppsInfoState, Action>({
  config,
  reducer,
});
