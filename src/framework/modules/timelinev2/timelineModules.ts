/**
 * A specific moduleMap that exists inside timeline
 */

import I18n from "i18n-js";
import type { NavigationNavigateActionPayload } from "react-navigation";
import type { RouteMap } from "../../util/moduleTool";

import { createCustomSubscription } from "../../util/moduleTool";
import { IUserSession } from "../../util/session";

// Timeline module subscription ===================================================================

// export const timelineModules = createModuleSubscription<AnyNavigableModule>();
export const timelineSubModules = createCustomSubscription<
    RouteMap, RouteMap
>(subs => subs.reduce((acc, s) => ({ ...acc, ...s }), {}));

// Timeline workflow ==============================================================================

export interface ITimelineWorkflowDefinition {
    (session: IUserSession): undefined | false | { icon: string; i18n: string; goTo: NavigationNavigateActionPayload };
};
const registeredTimelineWorkflows: ITimelineWorkflowDefinition[] = [];
export const registerTimelineWorkflow = (def: ITimelineWorkflowDefinition) => {
    registeredTimelineWorkflows.push(def);
    return def;
}
export const registerTimelineWorkflows = (def: ITimelineWorkflowDefinition[]) => {
    return def.map(d => registerTimelineWorkflow(d));
}
export const getRegisteredTimelineWorkflow = () => registeredTimelineWorkflows;

export const getTimelineWorkflows = (session: IUserSession) => registeredTimelineWorkflows.map(d => d(session)).filter(dr => dr).sort(
    (a, b) => I18n.t((a as { i18n: string; }).i18n).localeCompare((b as { i18n: string; }).i18n)
) as unknown as Array<{ icon: string; i18n: string; goTo: NavigationNavigateActionPayload }>;