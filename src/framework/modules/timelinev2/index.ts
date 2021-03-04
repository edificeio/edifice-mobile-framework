import { Module, registerTabModule } from "../../moduleTool";

import config from './moduleConfig';
import mainComp from './navigator';
import reducer from './reducer';

export default registerTabModule(
    new Module({
        config, mainComp, reducer, actions: {}
    }),
    0
);
