import { Platform } from 'react-native';
import firebase from "react-native-firebase";

let analytics;
try{
	analytics = firebase.app().analytics();
}
catch(e){
	console.log(e);
}

export class Tracking {
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
		}
		else{
			analytics.logEvent(name);
		}
	}

	public static trackScreenView(currentScreen, navParams) {
		Tracking.logEvent(currentScreen, navParams)
	}
}
