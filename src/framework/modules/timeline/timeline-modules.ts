/**
 * A specific moduleMap that exists inside timeline
 */

import I18n from 'i18n-js';
import type { NavigationNavigateActionPayload } from 'react-navigation';

import { CustomRegister, RouteMap } from '~/framework/util/moduleTool';
import { IUserSession } from '~/framework/util/session';

// Timeline module register =======================================================================

export const timelineSubModules = new CustomRegister<RouteMap, RouteMap>(items => items.reduce((acc, s) => ({ ...acc, ...s }), {}));

// Timeline workflow ==============================================================================

export interface ITimelineWorkflowDefinition {
  (session: IUserSession): undefined | false | { icon: string; i18n: string; goTo: NavigationNavigateActionPayload };
}
const registeredTimelineWorkflows: ITimelineWorkflowDefinition[] = [];
export const registerTimelineWorkflow = (def: ITimelineWorkflowDefinition) => {
  registeredTimelineWorkflows.push(def);
  return def;
};
export const registerTimelineWorkflows = (def: ITimelineWorkflowDefinition[]) => {
  return def.map(d => registerTimelineWorkflow(d)); // Map is used here to keep call chaining available.
};
export const getRegisteredTimelineWorkflow = () => registeredTimelineWorkflows;

export const getTimelineWorkflows = (session: IUserSession) =>
  registeredTimelineWorkflows
    .map(d => d(session))
    .filter(dr => dr)
    .sort((a, b) => I18n.t((a as { i18n: string }).i18n).localeCompare((b as { i18n: string }).i18n)) as unknown as {
    icon: string;
    i18n: string;
    goTo: NavigationNavigateActionPayload;
  }[];
