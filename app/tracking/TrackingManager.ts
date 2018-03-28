import firebase from "react-native-firebase";
import trackedActions from "./actions";

let analytics;
try{
	analytics = firebase.app().analytics();
}
catch(e){
	console.log(e);
}

export class Tracking {
	public static init() {
		try{
			// Issue with Typescript and react-native-firebase
			// https://github.com/invertase/react-native-firebase/issues/774
			//const crashlytics = firebase.fabric.crashlytics()
			const crashlytics = firebase.app().fabric.crashlytics();
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

	public static logEvent(name: string, params = null) {
		if(!analytics){
			return;
		}
		analytics.logEvent(name, params);
	}

	public static trackAction(action) {
		const trackedAction = trackedActions[`${action.type}${action.path}`]
		if (trackedAction) {
			this.logEvent(trackedAction.name, trackedAction.format(action))
		}
	}

	public static trackScreenView(currentScreen, navParams) {
		Tracking.logEvent(currentScreen, navParams)
	}
}
