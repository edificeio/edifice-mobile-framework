///<reference path="../../utils/html.ts"/>
import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../../constants/layoutSize"
import { CommonStyles } from "../styles/common/styles"
import { Icon } from "./icons/Icon"
import { Avatars } from "./Avatars/Avatars"
import { ContainerBar, LeftPanel, RightPanel } from "./ContainerBar"
import { Size } from "./Avatars/Avatar"

export interface ThreadsBarProps {
	navigation?: any
}

const CenterPanel = style.view(
	{
		alignItems: "center",
		flex: 1,
		justifyContent: "center",
	},
	({ collapse }) => ({
		paddingTop: collapse ? layoutSize.LAYOUT_2 : layoutSize.LAYOUT_14,
	})
)

const Text = style.text(
	{
		color: "white",
		fontSize: layoutSize.LAYOUT_12,
		fontFamily: CommonStyles.primaryFontFamily,
	},
	({ bigsize = false }) => ({
		fontSize: bigsize ? layoutSize.LAYOUT_18 : layoutSize.LAYOUT_12,
	})
)

export class ThreadsBar extends React.PureComponent<ThreadsBarProps, {}> {
	render() {
		const { navigation } = this.props
		const { collapse = false, displayNames, subject } = navigation.state.params

		return (
			<ContainerBar collapse={collapse}>
				<LeftPanel>
					<Icon size={layoutSize.LAYOUT_24} name={"back"} color={"white"} onPress={() => navigation.goBack()} />
				</LeftPanel>
				<CenterPanel collapse={collapse}>
					{!collapse && <Text bigsize>{subject}</Text>}
					<Avatars displayNames={displayNames} size={collapse ? Size.aligned : Size.bigaligned} />
					{collapse && <Text>{subject}</Text>}
				</CenterPanel>
				<RightPanel>
					<Icon size={layoutSize.LAYOUT_24} name={"more"} color={"white"} />
				</RightPanel>
			</ContainerBar>
		)
	}
}
