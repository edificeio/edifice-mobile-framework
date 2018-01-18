import * as React from "react"
import {TextInputProperties } from "react-native"
import { Col } from ".."
import { layoutSize } from "../../constants/layoutSize"
import { CommonStyles } from "../styles/common/styles"
import style from "glamorous-native"

export interface ContainerProps {
    focus?: boolean
    errMessage?: string,
    marginHorizontal?: number,
}

const Container = style.view(
	{
		paddingTop: layoutSize.LAYOUT_4,
		flex: 1,
	},
	({focus, errMessage, marginHorizontal}: ContainerProps) => ({
        borderBottomColor: focus ? CommonStyles.iconColorOn : errMessage.length > 0 ? CommonStyles.errorColor : CommonStyles.entryfieldBorder,
        borderBottomWidth: focus || errMessage.length > 0 ? 2 : 1,
        marginHorizontal
	}))

const TextInput = style.textInput({
		color: CommonStyles.textInputColor,
	},
	({ fontSize, multiline, value }) => ({
		fontFamily: value.length === 0 ? CommonStyles.primaryFontFamilyLight : CommonStyles.primaryFontFamily,
		fontSize,
		height: multiline ? layoutSize.LAYOUT_60 : layoutSize.LAYOUT_40
	})
)


const Error = style.text({
	color: "red",
	height: layoutSize.LAYOUT_32,
	fontFamily: CommonStyles.primaryFontFamily,
	fontSize: layoutSize.LAYOUT_14,
	marginBottom: 0
})

export interface TextInputErrorProps extends TextInputProperties {
    clearButtonMode?: any
    enablesReturnKeyAutomatically?: boolean
    error?: any,
	errCodes?: number[],
    fontSize?: number,
	label?: string,
    marginHorizontal?: number,
	onChange?: (any) => any
    returnKeyType?: any
}

export interface TextInputErrorState {
	value: string
	showDescription: boolean
	focus: boolean
}

export class TextInputError extends React.Component<TextInputErrorProps, TextInputErrorState> {
	public static defaultProps = {
		editable: true,
		error: {
			code: 0,
			message: "",
		},
		errCodes: [],
        fontSize: layoutSize.LAYOUT_14,
		label: "",
        marginHorizontal: 0,
		multiline: false,
		onChange: val => val,
		secureTextEntry: false,
		value: "",
	}

	constructor(props) {
		super(props)
		this.state = {
			value: this.props.value,
			showDescription: false,
			focus: false,
		}
	}

	public hasErrorsMessage(): string {
		const { code, message = "" } = this.props.error
		const { errCodes = [] } = this.props

		if (code !== 0 && errCodes.indexOf(code) >= 0) return message

		return ""
	}

    public onChangeText(value) {
        if (value === undefined) return

        this.setState({ value })
        this.props.onChange(value)
    }

	public render() {
		const errMessage = this.hasErrorsMessage()
		const { fontSize, label, marginHorizontal, multiline, secureTextEntry, editable, placeholderTextColor = CommonStyles.placeholderColor } = this.props
		const { focus } = this.state

		return (
			<Container errMessage={errMessage} focus={focus} marginHorizontal={marginHorizontal}>
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
				{errMessage.length > 0 && <Error>{errMessage}</Error>}
			</Container>
		)
	}
}
