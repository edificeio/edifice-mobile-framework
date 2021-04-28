/**
 * A specific moduleMap that exists inside user preferences pages
 */

import I18n from "i18n-js";
import { NavigationNavigateActionPayload } from "react-navigation";

import { createGetRegisteredModules, createRegisterModule, IRegisteredModule } from "../../util/moduleTool";
import { IUserSession } from "../../util/session";

const registeredUserPreferencesModules: IRegisteredModule[] = [];
export const getRegisteredUserPreferencesModules = createGetRegisteredModules(registeredUserPreferencesModules);
export const registerUserPreferencesModule = createRegisterModule(registeredUserPreferencesModules);

export interface IPreferencePanelDefinition {
    (session: IUserSession): undefined | false | { i18n: string; goTo: NavigationNavigateActionPayload };
};
const registeredPreferencePanels: IPreferencePanelDefinition[] = [];
export const registerPreferencePanel = (def: IPreferencePanelDefinition) => {
    registeredPreferencePanels.push(def);
    return def;
}
export const registerPreferencePanels = (def: IPreferencePanelDefinition[]) => {
    return def.map(d => registerPreferencePanel(d));
}
export const getRegisteredPreferencePanels = () => registeredPreferencePanels;

export const getPreferencePanels = (session: IUserSession) => registeredPreferencePanels.map(d => d(session)).filter(dr => dr).sort(
    (a, b) => I18n.t((a as { i18n: string; }).i18n).localeCompare((b as { i18n: string; }).i18n)
) as unknown as Array<{ icon: string; i18n: string; goTo: NavigationNavigateActionPayload }>;
