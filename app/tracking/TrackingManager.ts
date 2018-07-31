import { Platform } from 'react-native';
import firebase from "react-native-firebase";
import { MixpanelInstance } from "react-native-mixpanel";
import { Me } from "../infra/Me";
import { initialStateWithEmail } from '../auth/Login';


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
	private static mixpanelToken: string;

	// TODO : Externalize mixpanel token configuration
	static async initMixpanel() {
		if(Platform.OS === 'ios'){ // FIXME : Mixpanel doesn't startup on iOS.
			Tracking.mixpanelToken = 'c82f3785bad1015243c64ad254086189';
		} else if (Platform.OS === 'android'){
			Tracking.mixpanelToken = 'c82f3785bad1015243c64ad254086189';
		}
		Tracking.mixpanel = new MixpanelInstance(Tracking.mixpanelToken);
		await Tracking.mixpanel.initialize();
		console.warn("1" + Me.session.userId);
		console.warn('Mixpanel init done ' + Tracking.mixpanel);
		console.warn(Tracking.mixpanel);
	}

	public static init() {
		try{
			const crashlytics = firebase.crashlytics();
			crashlytics.log("Crashlytics configuration done.");
			console.warn("2" + Me.session.userId);
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
		if(analytics){
			if (params) analytics.logEvent(name, params);
			else analytics.logEvent(name);
		}
		if(Tracking.mixpanel){
			if (params) Tracking.mixpanel.track(name, params);
			else Tracking.mixpanel.track(name);
		}
		console.warn("Identifant:" + Me.session.userId);
		Tracking.mixpanel.identify(Me.session.userId);
		Tracking.mixpanel.set({"$Login": Me.session.login});
		Tracking.mixpanel.set({"$UserId": Me.session.userId});
	}

	public static trackScreenView(currentScreen, navParams) {
		Tracking.logEvent(currentScreen, navParams)
	}
}
Tracking.initMixpanel();
console.warn("4" + Me.session.userId);
/*console.warn(Me);
Tracking.mixpanel.identify(Me.session.userId);
Tracking.mixpanel.set({"$email": initialStateWithEmail});
*/