import config from './module-config';
import getRoot from './navigation/navigator';
import { storage } from './storage';

import { NavigableModule } from '~/framework/util/moduleTool';

import './myAppsModules'; // To initialize the module registers

const reducer = () => null;

module.exports = new NavigableModule({ config, getRoot, reducer, storage });
