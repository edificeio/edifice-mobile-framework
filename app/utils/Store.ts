import { AsyncStorage } from "react-native"
import { Conf } from "../Conf";

export async function setLogin(value) {
	await AsyncStorage.setItem(Conf.authLoginStore, JSON.stringify(value))
}

export async function getLogin() {
	const authString = await AsyncStorage.getItem(Conf.authLoginStore)

	if (authString === null) {
		return {
			email: "",
			password: "",
		}
	}
	return JSON.parse(authString)
}