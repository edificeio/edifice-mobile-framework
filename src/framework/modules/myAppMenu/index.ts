import { NavigableModule } from "~/framework/util/moduleTool";

import config from './moduleConfig';
import getRoot from './navigation/navigator';
const reducer = () => null;

module.exports = new NavigableModule({ config, getRoot, reducer });
