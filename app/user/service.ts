import firebase from "react-native-firebase";
import {
    signedFetch
} from "../infra/fetchWithCache";
import { Connection } from "../infra/Connection";
import Conf from "../Conf";
import { AsyncStorage } from "react-native";

class UserService {
    static FCM_TOKEN_TODELETE_KEY = "users.fcmtokens.todelete";
    lastRegisteredToken: string;
    pendingRegistration: "initial" | "delayed" | "registered" = "initial";
    constructor() {
        firebase.messaging().onTokenRefresh(token => {

        })
        Connection.onEachNetworkBack(async () => {
            if (this.pendingRegistration == "delayed") {
                await this.registerFCMToken();
            }
            this._cleanQueue();
        });
    }
    private async _cleanQueue() {
        const tokens = await this._getTokenToDeleteQueue();
        //console.log("trying to unregister queue: ", tokens)
        tokens.forEach(token => {
            this.unregisterFCMToken(token);
        })
    }
    private async _getTokenToDeleteQueue(): Promise<string[]> {
        try {
            let tokensCached = await AsyncStorage.getItem(UserService.FCM_TOKEN_TODELETE_KEY);
            let tokens: string[] = JSON.parse(tokensCached);
            if (tokens instanceof Array) {
                //console.log("fetched token from cache:", tokens)
                return tokens
            } else {
                //console.warn("not an array?", tokens)
            }
        } catch (e) {
            //console.warn(e);
        }
        return [];
    }
    private async _addTokenToDeleteQueue(token: string) {
        if (!token) {
            return;
        }
        //merge is not supported by all implementation
        const tokens = await this._getTokenToDeleteQueue();
        tokens.push(token);
        //keep uniq tokens
        const json = JSON.stringify(Array.from(new Set(tokens)))
        //console.log("saving tokens....", json)
        await AsyncStorage.setItem(UserService.FCM_TOKEN_TODELETE_KEY, json)
        //console.log("added token to delete queue : ", token, json)
    }
    private async _removeTokenFromDeleteQueue(token: string) {
        if (!token) {
            return;
        }
        //merge is not supported by all implementation
        let tokens = await this._getTokenToDeleteQueue();
        tokens = tokens.filter(t => t != token);
        const json = JSON.stringify(tokens);
        await AsyncStorage.setItem(UserService.FCM_TOKEN_TODELETE_KEY, json)
        //console.log("removed token to delete queue : ", token, json)
    }
    async unregisterFCMToken(token = null) {
        try {
            if (!token) {
                token = await firebase.messaging().getToken();
            }
            //console.log("unregistering token : ", token);
            const deleteTokenResponse = await signedFetch(
                `${
                Conf.currentPlatform.url
                }/timeline/pushNotif/fcmToken?fcmToken=${token}`,
                { method: "delete" }
            );
            this._removeTokenFromDeleteQueue(token);
        } catch (err) {
            //unregistering fcm token should not crash the login process
            if (Connection.isOnline) {
                //console.warn(err);
            } else {
                //when no connection => get it from property
                const tokenTOUnregister = token || this.lastRegisteredToken;
                //console.log("saving token to a queue...", tokenTOUnregister);
                this._addTokenToDeleteQueue(tokenTOUnregister);
            }
        }
    }
    async registerFCMToken(token = null) {
        // //console.log(token);
        try {
            this.pendingRegistration = "initial";
            if (!token) {
                token = await firebase.messaging().getToken();
            }
            this.lastRegisteredToken = token;
            //console.log("registering token : ", token);
            const putTokenResponse = await signedFetch(
                `${
                Conf.currentPlatform.url
                }/timeline/pushNotif/fcmToken?fcmToken=${token}`,
                {
                    method: "put"
                }
            );
            this.pendingRegistration = "registered";
            //try to unregister queue
            this._cleanQueue();//clean queue on login
            //
        } catch (err) {
            //registering fcm token should not crash the login process
            if (Connection.isOnline) {
                //console.warn(err);
            } else {
                //console.log("there is not network => wait until network back to register token")
                this.pendingRegistration = "delayed";
            }
        }
        // //console.log("Fcm Token (put) :", token, putTokenResponse);

    }
}

export const userService = new UserService;