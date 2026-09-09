/**
 * A specific moduleMap that exists inside timeline
 */
import { NavigationProp } from '@react-navigation/native';

import { AllModulesNavigationParams } from '~/app/navigation/types';
import { MenuAction } from '~/framework/components/menus/actions';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { ModuleRegister, ModuleType, setGlobalRegister, UnknownNavigableModule } from '~/framework/util/moduleTool';

// Timeline workflow ==============================================================================

export const timelineWidgets = new ModuleRegister<UnknownNavigableModule>();

export interface ITimelineWorkflowDefinition {
  (session: AuthActiveAccount, navigation: NavigationProp<AllModulesNavigationParams>): undefined | false | MenuAction;
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

export const getTimelineWorkflows = (session: AuthActiveAccount, navigation: NavigationProp<AllModulesNavigationParams>) =>
  registeredTimelineWorkflows.reduce((acc, current) => {
    const action = current(session, navigation);
    if (action) {
      acc.push(action);
    }
    return acc;
  }, [] as MenuAction[]);

setGlobalRegister(ModuleType.MYAPPS_WIDGET, timelineWidgets);
