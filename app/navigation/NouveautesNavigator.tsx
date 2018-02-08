import { StackNavigator } from "react-navigation"
import News from "../connectors/News"
import { tr } from "../i18n/t"
import { navOptions } from "../utils/navHelper"

export default StackNavigator({
	Nouveautes: {
		navigationOptions: ({ navigation }) => navOptions({ title: tr.News }),
		screen: News,
	},
})
