import { Conf } from "../Conf";
import { AsyncStorage, NetInfo } from "react-native";
import { Connection } from "./Connection";

console.log(Conf.platform);

export const read = async (path, forceSync:boolean = true) => {
    if(!Connection.isOnline){
        console.log('User offline, reading from cache');
    }
    const fromCache = await AsyncStorage.getItem(path);

    if(Connection.isOnline && !(!forceSync && fromCache)){
        const response = await fetch(`${Conf.platform}${path}`);
        const data = await response.json();
        await AsyncStorage.setItem(path, JSON.stringify(data));
        return data;
    }
    
    if(fromCache){
        return JSON.parse(fromCache);
    }
    return [];
}

export const usersAvatars = async () => {
    const latestAvatars = await AsyncStorage.getItem('latestUsersAvatars');
    const d = new Date();
    if(Connection.isOnline && latestAvatars != d.getDate().toString()){
        return {};
    }
    const avatars = await AsyncStorage.getItem('usersAvatars');
    console.log(avatars)
    return JSON.parse(avatars);
};

export const setUsersAvatars = async (avatars) => {
    const d = new Date();
    await AsyncStorage.setItem('latestUsersAvatars', d.getDate().toString());
    await AsyncStorage.setItem('usersAvatars', JSON.stringify(avatars));
}