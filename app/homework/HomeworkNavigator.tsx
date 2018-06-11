import * as React from "react";
import { StackNavigator } from "react-navigation";
import { Header, HeaderIcon, AppTitle } from "../ui/headers/Header";
import { navOptions } from "../utils/navHelper";
import { Homework } from "./components/Homework";

export default StackNavigator(
	{
		Homework: {
			screen: Homework,
			navigationOptions: ({ navigation }) => navOptions({
				header: <HomeworkHeader navigation={ navigation } />
			}, navigation)
		}
	}
)

export class HomeworkHeader extends React.Component<{ navigation?: any }, undefined> {
	render() {
		return (
            <Header>
				<AppTitle>Homework</AppTitle>
            </Header>
		)
	}
}