import { read } from "./Cache";

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
    const response = await fetch(`/userbook/preference/${ appName }`, { 
        method: 'POST', 
        body: { ...preferences[appName], ...newData }
    });
}
export const preference = async (appName: string) => {
    const appPrefs = await read(`/userbook/preference/${ appName }`);
    preferences[appName] = appPrefs.preference;
    return JSON.parse(appPrefs.preference);
}