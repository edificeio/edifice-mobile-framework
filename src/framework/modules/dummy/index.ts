import { Module, registerTabModule } from "../../moduleTool";

import config from './moduleConfig';
import mainComp from './navigator';
import reducer from './reducer';

export default registerTabModule(  // call registertabModule() if you need to add tab access
    new Module({
        config, mainComp, reducer
    }),
    0
);
