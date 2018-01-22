import style from "glamorous-native"
import * as React from "react"
import { TextInputProperties, View } from "react-native"
import { layoutSize } from "../../constants/layoutSize"
import { CommonStyles } from "../styles/common/styles"
import { Error, hasErrorsMessage } from "./Error"
import { MessagesProps } from "../../model/messages"

export interface ContainerProps {
	focus?: boolean
	errMessage?: string
	marginHorizontal?: number
}

const Container = style.view(
	{
		paddingTop: layoutSize.LAYOUT_4,
		flex: 1,
	},
	({ focus, errMessage, marginHorizontal }: ContainerProps) => ({
		borderBottomColor:
			errMessage.length > 0 ? CommonStyles.errorColor : focus ? CommonStyles.iconColorOn : CommonStyles.entryfieldBorder,
		borderBottomWidth: focus || errMessage.length > 0 ? 2 : 1,
		marginHorizontal,
	})
)

const TextInput = style.textInput(
	{
		color: CommonStyles.textInputColor,
	},
	({ fontSize, multiline, value }) => ({
		fontFamily: value.length === 0 ? CommonStyles.primaryFontFamilyLight : CommonStyles.primaryFontFamily,
		fontSize,
		height: multiline ? layoutSize.LAYOUT_60 : layoutSize.LAYOUT_40,
	})
)

export interface TextInputErrorProps extends TextInputProperties {
	errCodes?: string[]
	fontSize?: number
	globalErr?: boolean
	label?: string
	messages?: MessagesProps[]
	marginHorizontal?: number
	onChange?: (any) => any
	showErr?: boolean
}

export interface TextInputErrorState {
	focus: boolean
	value: string
}

export class TextInputError extends React.Component<TextInputErrorProps, TextInputErrorState> {
	static newKey: boolean
	newKey: boolean
	static defaultProps = {
		editable: true,
		errCodes: [],
		fontSize: layoutSize.LAYOUT_14,
		globalErr: false,
		label: "",
		marginHorizontal: 0,
		messages: [],
		multiline: false,
		onChange: val => val,
		secureTextEntry: false,
		showErr: false,
		value: "",
	}

	constructor(props) {
		super(props)
		TextInputError.newKey = false
		this.newKey = false
		this.state = {
			value: this.props.value,
			focus: false,
		}
	}

	onChangeText(value) {
		if (value === undefined) {
			return
		}

		TextInputError.newKey = true
		this.newKey = true
		this.setState({ value })
		this.props.onChange(value)
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.messages !== nextProps.messages) {
			TextInputError.newKey = false
			this.newKey = false
		}
	}

	isNewkey() {
		if (this.props.globalErr) return TextInputError.newKey
		else return this.newKey
	}

	render() {
		const {
			editable,
			errCodes,
			fontSize,
			label,
			marginHorizontal,
			messages,
			multiline,
			placeholderTextColor = CommonStyles.placeholderColor,
			secureTextEntry,
			showErr,
		} = this.props
		const { focus } = this.state

		return (
			<View>
				<Container
					errMessage={TextInputError.newKey ? "" : hasErrorsMessage({ errCodes, messages })}
					focus={focus}
					marginHorizontal={marginHorizontal}
				>
					<TextInput
						editable={editable}
						fontSize={fontSize}
						multiline={multiline}
						onChangeText={value => this.onChangeText(value)}
						onBlur={() => this.setState({ focus: false })}
						onFocus={() => this.setState({ focus: true })}
						placeholder={label}
						placeholderTextColor={placeholderTextColor}
						secureTextEntry={secureTextEntry}
						underlineColorAndroid={"transparent"}
						value={this.state.value}
					/>
				</Container>
				{showErr && !TextInputError.newKey && <Error errCodes={errCodes} messages={messages} />}
			</View>
		)
	}
}
