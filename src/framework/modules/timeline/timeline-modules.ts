/**
 * A specific moduleMap that exists inside timeline
 */
import { NavigationProp } from '@react-navigation/native';

import { AllModulesNavigationParams } from '~/app/navigation/types';
import { getStore } from '~/app/store';
import { MenuAction } from '~/framework/components/menus/actions';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { getAppLookupMap } from '~/framework/modules/myapps/hooks/lookup';
import { resolveAppTheme, selectAggregatedApps } from '~/framework/modules/myapps/reducer';
import { ModuleRegister, ModuleType, setGlobalRegister, UnknownNavigableModule } from '~/framework/util/moduleTool';

// Timeline workflow ==============================================================================

export const timelineWidgets = new ModuleRegister<UnknownNavigableModule>();

export interface TimelineWorkflow extends MenuAction {
  appName?: string;
}

export interface ITimelineWorkflowDefinition {
  (session: AuthActiveAccount, navigation: NavigationProp<AllModulesNavigationParams>): undefined | false | TimelineWorkflow;
}

// The workflows are built outside a render, where no hook can read the store.
const appColor = (appName?: string) =>
  appName ? resolveAppTheme(appName, getAppLookupMap(selectAggregatedApps(getStore().getState())))?.colors.regular : undefined;
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
    const workflow = current(session, navigation);
    if (workflow) {
      const { appName, ...action } = workflow;
      acc.push({ ...action, imageColor: appColor(appName) });
    }
    return acc;
  }, [] as MenuAction[]);

setGlobalRegister(ModuleType.MYAPPS_WIDGET, timelineWidgets);
