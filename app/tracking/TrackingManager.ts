import { Platform } from 'react-native';
import firebase from "react-native-firebase";
import { MixpanelInstance } from "react-native-mixpanel";


// Firebase Init
let analytics;
try{
	analytics = firebase.app().analytics();
}
catch(e){
	console.warn(e);
}

export class Tracking {

	// Mixpanel Init
	private static mixpanel;
	// TODO : Externalize mixpanel token configuration
	static async initMixpanel() {
		Tracking.mixpanel = new MixpanelInstance('9cc560e73f2e7b38c0b247fcd8c84e5a')
		await Tracking.mixpanel.initialize()
		console.warn('Mixpanel init done ' + Tracking.mixpanel);
	}

	public static init() {
		if(Platform.OS === 'ios'){
			return;
		}
		try{
			const crashlytics = firebase.crashlytics();
			crashlytics.log("Crashlytics configuration done.");

			const perfMonitoring = (firebase.app() as any).perf();
			const trace = perfMonitoring.newTrace(`PerformanceMonitoring_configuration_done`);
			trace.start();
			trace.incrementCounter(`PerformanceMonitoring__increment`);
			trace.stop();
		}
		catch(e){
			console.log(e);
		}
	}

	public static logEvent(name: string, params?) {
		if(!analytics){
			return;
		}
		if(params){
			analytics.logEvent(name, params);
			Tracking.mixpanel.track(name, params);
		}
		else{
			analytics.logEvent(name);
			Tracking.mixpanel.track(name);
		}
	}

	public static trackScreenView(currentScreen, navParams) {
		Tracking.logEvent(currentScreen, navParams)
	}
}
Tracking.initMixpanel();
