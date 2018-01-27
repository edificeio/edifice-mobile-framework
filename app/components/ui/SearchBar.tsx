import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../../constants/layoutSize"
import { PATH_CONVERSATION } from "../../constants/paths"
import { CommonStyles } from "../styles/common/styles"
import { ContainerBar, LeftPanel, RightPanel } from "./ContainerBar"
import { CloseIcon, SearchIcon } from "./icons/SearchIcon"

export interface SearchBarProps {
	filter?: (store: string, value: string) => object
	navigation?: any
	path?: string
}

const TextInput = style.textInput(
	{
		color: "white",
		fontSize: layoutSize.LAYOUT_14,
		flex: 1,
		marginLeft: layoutSize.LAYOUT_8,
		paddingTop: layoutSize.LAYOUT_14,
	},
	({ value }) => ({
		fontFamily: value.length === 0 ? CommonStyles.primaryFontFamilyLight : CommonStyles.primaryFontFamily,
		height: layoutSize.LAYOUT_40,
	})
)

export class SearchBar extends React.PureComponent<SearchBarProps, {}> {
	public state = {
		value: "",
	}

	public onChangeText(value) {
		const { filter, path } = this.props

		if (value === undefined) {
			return
		}

		filter(path, value)

		this.setState({ value })
	}

	public onClose() {
		const { filter, navigation } = this.props

		filter(PATH_CONVERSATION, null)

		navigation.goBack()
	}

	public render() {
		return (
			<ContainerBar collapse={true}>
				<LeftPanel>
					<SearchIcon onPress={() => {}} screen={"ConversationSearch"} />
				</LeftPanel>
				<TextInput
					autoFocus={true}
					enablesReturnKeyAutomatically={true}
					onChangeText={value => this.onChangeText(value)}
					placeholder={"Rechercher..."}
					placeholderTextColor={"white"}
					returnKeyType={"search"}
					underlineColorAndroid={"transparent"}
					value={this.state.value}
				/>
				<RightPanel>
					<CloseIcon onPress={() => this.onClose()} />
				</RightPanel>
			</ContainerBar>
		)
	}
}
