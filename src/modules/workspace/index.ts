import { NavigableModule } from '~/framework/util/moduleTool';

import config from './moduleConfig';
import getRoot from './navigator';
import reducer from './reducer';

module.exports = new NavigableModule({ config, getRoot, reducer });
