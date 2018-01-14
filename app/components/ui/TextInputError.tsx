import * as React from "react"
import {Text, TextInput, TextInputProperties, TextStyle, TextStyleAndroid, View} from "react-native"
import { Col } from ".."
import { layoutSize } from "../../constants/layoutSize"
import { CommonStyles } from "../styles/common/styles"
import g from "glamorous-native"

export interface ContainerProps {
    focus?: boolean
    errMessage?: string
}

const Container = g.view(
	{
		paddingTop: layoutSize.LAYOUT_4
	},
	({focus, errMessage}: ContainerProps) => ({
        borderBottomColor: focus ? CommonStyles.iconColorOn : errMessage.length > 0 ? CommonStyles.errorColor : CommonStyles.entryfieldBorder,
        borderBottomWidth: focus || errMessage.length > 0 ? 2 : 1
	}))

const Input = g.textInput({
		color: CommonStyles.textInputColor,
		fontSize: layoutSize.LAYOUT_14,
	},
	({ multiline, value, ...props }) => ({
		fontFamily: value.length === 0 ? CommonStyles.primaryFontFamilyLight : CommonStyles.primaryFontFamily,
		height: multiline ? layoutSize.LAYOUT_60 : layoutSize.LAYOUT_40,
		...props
	})
)


const Error = g.text({
	color: "red",
	height: layoutSize.LAYOUT_32,
	fontFamily: CommonStyles.primaryFontFamily,
	fontSize: layoutSize.LAYOUT_14,
	marginBottom: 0
})

export interface TextInputErrorProps extends TextInputProperties{
	errCodes?: number[],
	error?: any,
	label: string,
	onChange?: (any) => any
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
		label: "",
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
		const { label, multiline, secureTextEntry, editable } = this.props
		const { focus } = this.state

		return (
			<Container errMessage={errMessage} focus={focus} >
				<Input
					editable={editable}
					multiline={multiline}
					onChangeText={value => this.onChangeText(value)}
					onBlur={() => this.setState({ focus: false })}
					onFocus={() => this.setState({ focus: true })}
					placeholder={label}
                    placeholderTextColor={CommonStyles.placeholderColor}
					secureTextEntry={secureTextEntry}
                    underlineColorAndroid={"transparent"}
					value={this.state.value}
				/>
				{errMessage.length > 0 && <Error>{errMessage}</Error>}
			</Container>
		)
	}
}
