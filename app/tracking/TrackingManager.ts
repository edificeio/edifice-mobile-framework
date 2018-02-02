import { Platform } from "react-native"
import firebase from "react-native-firebase"
import trackedPages from "./pages"
import trackedActions from "./actions"

const analytics = firebase.app().analytics()

/* TODO: update interfaces with true implementation */
interface IReduxStore {
	getState: () => object
	subscribe: (callback: Function) => Function
}

interface ITrackedPage {
	format: (state: object, params: object) => object
	name: string
	isDataReady: (state: object) => boolean
	unsubscribe: Function
	reject: (name: string) => void
}

interface ITrackingManager {
	getState: () => object
	trackScreenView: (currentScreen: string, navParams: object) => void
}

class TrackingManager {
	private store: IReduxStore
	private trackedPage: ITrackedPage
	public init(store) {
		this.store = store
	}
	public logEvent(name, params) {
		/* DEBUG tracking event 
    console.log(name, params);
    */
		analytics.logEvent(name, params)
	}
	public trackAction(action) {
		const trackedAction = trackedActions[`${action.type}${action.path}`]
		if (trackedAction) {
			this.logEvent(trackedAction.name, trackedAction.format(action))
		}
	}
	public trackScreenView(currentScreen, navParams) {
		console.log(trackedPages[currentScreen], currentScreen)
		if (trackedPages[currentScreen]) {
			this.delegate(currentScreen)
				.then((trackedPage: ITrackedPage) => {
					const name = trackedPage.name
					const data = trackedPage.format(this.store.getState(), navParams)
					this.logEvent(name, data)
				})
				.catch(error => {
					/* eslint-disable no-console */
					console.warn("tracking catch", error)
					/* eslint-enable no-console */
				})
		}
	}

	private checkCurrentPageIsReady() {
		return this.trackedPage && this.trackedPage.isDataReady(this.store.getState())
	}

	private unsubscribeCurrentPage(callReject = false) {
		if (this.trackedPage && this.trackedPage.unsubscribe) {
			this.trackedPage.unsubscribe()
			this.trackedPage.unsubscribe = undefined
			if (callReject && this.trackedPage.reject) {
				this.trackedPage.reject(this.trackedPage.name)
			}
			this.trackedPage = undefined
		}
	}

	private delegate(view) {
		this.unsubscribeCurrentPage(true)
		this.trackedPage = trackedPages[view]

		return new Promise((resolve, reject) => {
			if (this.checkCurrentPageIsReady()) {
				resolve(this.trackedPage)
			} else {
				this.trackedPage.reject = reject
				this.trackedPage.unsubscribe = this.store.subscribe(() => {
					if (this.checkCurrentPageIsReady()) {
						resolve(this.trackedPage)
						this.unsubscribeCurrentPage()
					}
				})
			}
		})
	}
}
export default new TrackingManager()
