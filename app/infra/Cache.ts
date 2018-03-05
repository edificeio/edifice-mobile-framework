import { Conf } from "../Conf";
import { AsyncStorage, NetInfo } from "react-native";
import { Connection } from "./Connection";

console.log(Conf.platform);

export const read = async (path) => {
    if(!Connection.isOnline){
        console.log('User offline, reading from cache');
    }
    if(Connection.isOnline){
        const response = await fetch(`${Conf.platform}${path}`);
        const data = await response.json();
        await AsyncStorage.setItem(path, JSON.stringify(data));
        return data;
    }
    const fromCache = await AsyncStorage.getItem(path);
    if(fromCache){
        return JSON.parse(fromCache);
    }
    return [];
}