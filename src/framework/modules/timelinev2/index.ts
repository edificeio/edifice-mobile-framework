import { Module } from "../../moduleTool";

import config from './moduleConfig';
import mainComp from './navigator';
import reducer from './reducer';

export default new Module({
    config, mainComp, reducer, actions: {}
});
