import { StackNavigator } from "react-navigation"
import Timeline from "../connectors/Timeline"
import { navOptions } from "../utils/navHelper"

export default StackNavigator({
	Nouveautes: {
		screen: Timeline,
		navigationOptions: ({ navigation }) => navOptions({ title: "Nouveautés" }),
	},
})
