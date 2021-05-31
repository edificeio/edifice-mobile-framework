/**
 * Session getter
 * TEMPORARY MODULE : In waiting to a proper session management (auth module), this compatibility module exposes IUserSession getter from global redux state
 */

import { IPlatformConf } from "../infra/appConf";
import Conf from "../../ode-framework-conf";
import { OAuth2RessourceOwnerPasswordClient } from "../infra/oauth";
import { IEntcoreApp } from "./moduleTool";

export enum UserType {
    STUDENT, RELATIVE, TEACHER, PERSONNEL, GUEST
}

export const getUserType = (type: string) => {
    switch (type) {
        case "Student": return UserType.STUDENT;
        case "Relative": return UserType.RELATIVE;
        case "Teacher": return UserType.TEACHER;
        case "Personnel": return UserType.PERSONNEL;
        case "Guest": return UserType.GUEST;
    }
}

export interface IUserDefinition {
    login: string,
    id: string,
    displayName: string,
    type: UserType,
    entcoreApps: IEntcoreApp[]
}

export interface IUserSession {
    platform: IPlatformConf,
    oauth: OAuth2RessourceOwnerPasswordClient,
    user: IUserDefinition
}

export const getUserSession = (state: any) => ({
    platform: Conf.currentPlatform!,
    oauth: OAuth2RessourceOwnerPasswordClient.connection,
    user: {
        login: state.user.auth.login,
        id: state.user.info.id,
        displayName: state.user.info.displayName,
        type: getUserType(state.user.info.type),
        entcoreApps: state.user.auth.appsInfo
    }
}) as IUserSession;