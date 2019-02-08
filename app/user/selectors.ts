import { IActivationState } from "./reducers/activation";
import userConfig from "./config";
import { IUserAuthState } from "./reducers/auth";


export function getAuthState(globalState): IUserAuthState {
    const userState = globalState[userConfig.reducerName];
    if (!userState) {
        return undefined;
    }
    const authState: IUserAuthState = userState.auth;
    return authState;
}
export function getActivationState(globalState): IActivationState {
    const userState = globalState[userConfig.reducerName];
    if (!userState) {
        return undefined;
    }
    const activationState: IActivationState = userState.activation;
    return activationState;
}
export function isInActivatingMode(globalState): boolean {
    const activationState: IActivationState = getActivationState(globalState);
    return activationState && activationState.isActivating;
}