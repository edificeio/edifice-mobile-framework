/**
 * Async Storage Helper
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const getItemJson = async <T>(k: string) => {
    try {
        const ret = await AsyncStorage.getItem(k);
        if (!ret) return {};
        else return JSON.parse(ret) as T;
    } catch (e) {
        if (e instanceof Error) throw new Error(`[Storage] getItemJson: failed to load key "${k}": ${(e as Error).message}`);
        else throw new Error(`[Storage] getItemJson: failed to load key "${k}"`);
    }
}

export const setItemJson = async <T>(k: string, data: T) => {
    try {
        return AsyncStorage.setItem(k, JSON.stringify(data));
    } catch (e) {
        if (e instanceof Error) throw new Error(`[Storage] setItemJson: failed to write key "${k}": ${(e as Error).message}`);
        else throw new Error(`[Storage] setItemJson: failed to write key "${k}"`);
    }
}
