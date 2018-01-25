import firebase from "react-native-firebase"

// Issue with Typescript and react-native-firebase
// https://github.com/invertase/react-native-firebase/issues/774
// const crashlytics = firebase.fabric.crashlytics()
const crashlytics = firebase.app().fabric.crashlytics()
crashlytics.log("Crashlytics configuration done.")
