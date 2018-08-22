import * as React from "react";
import { PageContainer, Content } from "../ContainerContent";
import { ScrollView, Text } from "react-native";
import UiButtons from "./UiButtons";
import UiContainers from "./UiContainers";

/**
 * Page container that show every UI component.
 */
export class UiShowCase extends React.Component{

	public render() {
		return (
			<PageContainer>
				<ScrollView>
					<UiButtons/>
					<UiContainers/>
					<Text>The end.</Text>
				</ScrollView>
			</PageContainer>
		);
	}

};