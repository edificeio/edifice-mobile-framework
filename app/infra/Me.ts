import { read } from "./Cache";
import { Conf } from "../Conf";

interface User{
    id: string
}

interface Session{
    userId: string;
    type: string[];
    displayName: string;
    children: User[];
    login: string;
}

export const Me = {
    session: {} as Session
}

let preferences = {} as any;

export const savePreference = async (appName: string, newData) => {
    console.log(newData);
    const response = await fetch(`${ Conf.platform }/userbook/preference/${ appName }`, { 
        method: 'PUT', 
        body: JSON.stringify({ ...preferences[appName], ...newData })
    });
}
export const preference = async (appName: string) => {
    const appPrefs = await read(`/userbook/preference/${ appName }`);
    preferences[appName] = JSON.parse(appPrefs.preference);
    return JSON.parse(appPrefs.preference);
}