import { Module } from '~/framework/util/moduleTool';

import config from './moduleConfig';
import reducer from './reducer';

module.exports = new Module({ config, reducer });
