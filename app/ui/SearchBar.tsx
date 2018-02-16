import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../constants/layoutSize"
import { PATH_CONVERSATION } from "../constants/paths"
import { CommonStyles } from "../styles/common/styles"
import { ContainerTopBar, TouchableBarPanel } from "./ContainerBar"
import { CloseIcon, SearchIcon } from "./icons/SearchIcon"
import {tr} from "../i18n/t";

export interface SearchBarProps {
	filter?: (store: string, value: string) => object
	navigation?: any
	path?: string
}

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
			<ContainerTopBar>
				<TouchableBarPanel>
					<SearchIcon />
				</TouchableBarPanel>
				<TextInput
					autoFocus={true}
					enablesReturnKeyAutomatically={true}
					onChangeText={value => this.onChangeText(value)}
					placeholder={tr.Search}
					placeholderTextColor={"white"}
					returnKeyType={"search"}
					underlineColorAndroid={"transparent"}
					value={this.state.value}
				/>
				<TouchableBarPanel onPress={() => this.onClose()}>
					<CloseIcon />
				</TouchableBarPanel>
			</ContainerTopBar>
		)
	}
}

const TextInput = style.textInput(
	{
		alignSelf: "center",
		color: "white",
		flex: 1,
		fontSize: layoutSize.LAYOUT_18,
		fontWeight: "400",
		marginLeft: layoutSize.LAYOUT_8,
	},
	({ value }) => ({
		fontFamily: value.length === 0 ? CommonStyles.primaryFontFamilyLight : CommonStyles.primaryFontFamily,
	})
)
