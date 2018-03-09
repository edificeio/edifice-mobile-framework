import style from "glamorous-native"
import * as React from "react";
import { PATH_CONVERSATION } from "../constants/paths"
import { CommonStyles } from "../styles/common/styles"
import { Header, HeaderIcon } from "./headers/Header"
import { CloseIcon, SearchIcon } from "./icons/SearchIcon"
import {tr} from "../i18n/t";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { filter } from "../actions/filter";

export interface SearchBarProps {
	filter?: (store: string, value: string) => object;
	path?: string;
	onClose: () => void
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
		const { filter } = this.props;
		filter(PATH_CONVERSATION, null);
		this.props.onClose();
	}

	public render() {
		return (
			<Header>
				<HeaderIcon name={ "search" } />
				<TextInput
					onBlur={ () => this.onClose() }
					autoFocus={true}
					enablesReturnKeyAutomatically={true}
					onChangeText={value => this.onChangeText(value)}
					placeholder={tr.Search}
					placeholderTextColor={"white"}
					returnKeyType={"search"}
					underlineColorAndroid={"transparent"}
					value={this.state.value}
				/>
				<HeaderIcon onPress={ () => this.onClose() } name={ "close" } />
			</Header>
		)
	}
}

const TextInput = style.textInput(
	{
		alignSelf: "center",
		color: "white",
		flex: 1,
		fontSize: 18,
		fontWeight: "400",
		marginLeft: 8,
	},
	({ value }) => ({
		fontFamily: value.length === 0 ? CommonStyles.primaryFontFamilyLight : CommonStyles.primaryFontFamily,
	})
)

const mapStateToProps = () => ({})

const dispatchAndMapActions = dispatch => bindActionCreators({ filter }, dispatch)

export default connect<{}, {}, SearchBarProps>(mapStateToProps, dispatchAndMapActions)(SearchBar)