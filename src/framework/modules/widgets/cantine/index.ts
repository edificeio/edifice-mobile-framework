import { Reducers } from '~/app/store';
import { NavigableModule } from '~/framework/util/moduleTool';

import setUpCantineHomeWidget from './home-widget';
import config from './module-config';
import getRoot from './navigation/navigator';
import { preferences } from './storage';
import { reducer } from './store';

module.exports = new NavigableModule({ config, getRoot, preferences, reducer });

Reducers.register(config.reducerName, reducer);

setUpCantineHomeWidget();
