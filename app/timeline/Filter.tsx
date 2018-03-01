import * as React from "react"
import { View } from "react-native";
import { Header } from "../ui/headers/Header";
import { Close } from "../ui/headers/Close";

export class FilterHeader extends React.Component<{ navigation: any }, undefined> {
	render() {
		return (
            <Header>
                <Close onClose={ () => this.props.navigation.goBack() } />
            </Header>
		)
	}
}

export class Filter extends React.Component<undefined, undefined> {
	render() {
		return (
			<View></View>
		)
	}
}