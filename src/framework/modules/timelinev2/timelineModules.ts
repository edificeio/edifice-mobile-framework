/**
 * A specific moduleMap that exists inside timeline
 */
import { CommonActions } from '@react-navigation/native';
import I18n from 'i18n-js';

import { ISession } from '~/framework/modules/auth/model';

// Timeline workflow ==============================================================================

export interface ITimelineWorkflowDefinition {
  (session: ISession): undefined | false | { icon: string; i18n: string; goTo: CommonActions.Action };
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

export const getTimelineWorkflows = (session: ISession) =>
  registeredTimelineWorkflows
    .map(d => d(session))
    .filter(dr => dr)
    .sort((a, b) => I18n.t((a as { i18n: string }).i18n).localeCompare((b as { i18n: string }).i18n)) as unknown as {
    icon: string;
    i18n: string;
    goTo: CommonActions.Action;
  }[];
