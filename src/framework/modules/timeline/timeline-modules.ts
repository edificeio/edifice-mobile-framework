/**
 * A specific moduleMap that exists inside timeline
 */
import { MenuAction } from '~/framework/components/menus/actions';
import { ISession } from '~/framework/modules/auth/model';

// Timeline workflow ==============================================================================

export interface ITimelineWorkflowDefinition {
  (session: ISession): undefined | false | MenuAction;
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

export const getTimelineWorkflows = (session: ISession) => registeredTimelineWorkflows.map(d => d(session)).filter(dr => dr);
