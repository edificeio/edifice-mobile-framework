import { StackNavigator } from "react-navigation"
import Timeline from "../connectors/Timeline"
import { navOptions } from "../utils/navHelper"
import { tr } from "../i18n/t"

export default StackNavigator({
	Nouveautes: {
		screen: Timeline,
		navigationOptions: ({ navigation }) => navOptions({ title: tr.Nouveautes }),
	},
})
