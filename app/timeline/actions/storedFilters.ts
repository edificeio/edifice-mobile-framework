import { AsyncStorage } from "react-native";

export const storedFilters = async () => {
	const apps = await AsyncStorage.getItem('timeline-filters');
	if(!apps){
		return { "BLOG": true, "NEWS": true, "SCHOOLBOOK": true };
	}
	return JSON.parse(apps);
}

export const storeFilters = async (availableApps) => await AsyncStorage.setItem('timeline-filters', JSON.stringify(availableApps));