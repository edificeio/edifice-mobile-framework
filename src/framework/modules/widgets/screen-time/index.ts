import { NavigableModule } from '~/framework/util/moduleTool';

import setUpScreenTimeHomeWidget from './home-widget';
import config from './module-config';
import getRoot from './navigation/navigator';
import { preferences } from './storage';

module.exports = new NavigableModule({ config, getRoot, preferences, reducer: () => null });

setUpScreenTimeHomeWidget();
