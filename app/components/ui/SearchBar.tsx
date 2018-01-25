import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../../constants/layoutSize"
import { CommonStyles } from "../styles/common/styles"
import { CloseIcon, SearchIcon } from "./icons/SearchIcon"
import { PATH_CONVERSATION } from "../../constants/paths"
import { ContainerBar } from "./ContainerBar"

export interface SearchBarProps {
	filter?: (store: string, value: string) => object
	navigation?: any
	path?: string
}

const Container = style.view({
	alignItems: "center",
	backgroundColor: CommonStyles.mainColorTheme,
	elevation: 5,
	flexDirection: "row",
	height: layoutSize.LAYOUT_58,
	justifyContent: "space-around",
	paddingHorizontal: layoutSize.LAYOUT_20,
	shadowColor: CommonStyles.shadowColor,
	shadowOffset: CommonStyles.shadowOffset,
	shadowOpacity: CommonStyles.shadowOpacity,
	shadowRadius: CommonStyles.shadowRadius,
})

const TextInput = style.textInput(
	{
		color: "white",
		fontSize: layoutSize.LAYOUT_14,
		flex: 1,
		marginLeft: layoutSize.LAYOUT_8,
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
				<SearchIcon onPress={() => {}} screen={"ConversationSearch"} />
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
				<CloseIcon onPress={() => this.onClose()} />
			</ContainerBar>
		)
	}
}
