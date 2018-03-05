import { NetInfo } from "react-native";

export const Connection = {
    isOnline: false
};

NetInfo.isConnected.fetch().then(isConnected => Connection.isOnline = isConnected);
NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => Connection.isOnline = isConnected);
