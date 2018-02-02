import { StackNavigator } from "react-navigation"
import Timeline from "../connectors/Timeline"
import { tr } from "../i18n/t"
import { navOptions } from "../utils/navHelper"

export default StackNavigator({
	Nouveautes: {
		navigationOptions: ({ navigation }) => navOptions({ title: tr.News }),
		screen: Timeline,
	},
})
