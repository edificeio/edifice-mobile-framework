/**
 * A specific moduleMap that exists inside timeline
 */

import { createGetRegisteredModules, createRegisterModule, IRegisteredModule } from "../../moduleTool";

const registeredTimelineModules: IRegisteredModule[] = [];
export const getRegisteredTimelineModules = createGetRegisteredModules(registeredTimelineModules);
export const registerTimelineModule = createRegisterModule(registeredTimelineModules);
