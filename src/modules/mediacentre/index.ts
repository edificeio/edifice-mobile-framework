import config from './moduleConfig';
import getRoot from './navigator';
import reducer from './reducers';

import { NavigableModule } from '~/framework/util/moduleTool';

module.exports = new NavigableModule({ config, getRoot, reducer });
