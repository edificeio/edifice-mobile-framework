import * as React from "react";
import { StackNavigator } from "react-navigation";
import { UiShowCase } from './UiShowcase';
import { Header, HeaderIcon, AppTitle } from "../headers/Header";
import { navOptions } from "../../utils/navHelper";

export default StackNavigator(
	{
		UiShowcase: {
			screen: UiShowCase,
			navigationOptions: ({ navigation }) => navOptions({ 
				header: <UiHeader navigation={ navigation } />
			}, navigation)
		}
	}
)

export class UiHeader extends React.Component<{ navigation?: any }, undefined> {
	render() {
		return (
            <Header>
				<AppTitle>UI Showcase</AppTitle>
            </Header>
		)
	}
}