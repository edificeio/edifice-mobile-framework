import { Module } from "../../moduleTool";

export default new Module({
    config: require("./moduleConfig").default,
    mainComp: require("./navigator").default,
    reducer: require("./reducer").default,
    actions: {}
});
