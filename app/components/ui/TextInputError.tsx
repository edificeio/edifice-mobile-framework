import * as React from "react"
import {StyleSheet, Text, TextInput} from "react-native"
import { Col, Row } from ".."
import { layoutSize } from "../../constants/layoutSize"
import {CommonStyles} from "../styles/common/styles";

const styles = StyleSheet.create( {
    inputError: {
        color: "red",
        height: layoutSize.LAYOUT_32,
        fontSize: layoutSize.LAYOUT_14,
        fontWeight: "700",
        paddingBottom: 0,
        marginBottom: 0,
    },
    textInput: {
        color: CommonStyles.textInputColor,
        height: layoutSize.LAYOUT_32,
        fontSize: layoutSize.LAYOUT_14,
        paddingBottom: 0,
        marginBottom: 0,
    },
    textInputMulti: {
        color: CommonStyles.textInputColor,
        fontSize: layoutSize.LAYOUT_14,
        height: layoutSize.LAYOUT_60,
    },
    textInputWrapper: {
        backgroundColor: "transparent",
        paddingBottom: layoutSize.LAYOUT_10,
    },
})

export interface TextInputErrorProps {
	editable?: boolean
	error?: any
	errCodes?: (string | number)[]
	keyboardType?: string
	label?: string
	marginTop?: number
	multiline?: boolean
	onChange?: (any) => any
	onFocus?: () => any
	secureTextEntry?: boolean
	style?: any
	value?: string
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
		onFocus: () => 1,
		secureTextEntry: false,
		value: "",
	}

	public state: TextInputErrorState = {
		value: this.props.value,
		showDescription: false,
		focus: false,
	}

	public onChangeText(value) {
		if (value === undefined) return

		this.setState({ value })
		this.props.onChange(value)
	}

	public hasErrorsMessage(): string {
		const { code, message = "" } = this.props.error
		const { errCodes = [] } = this.props

		if (code !== 0 && errCodes.indexOf(code) >= 0) return message

		return ""
	}

	public onFocus() {
		this.setState({ focus: true })
		this.props.onFocus()
	}

	public onBlur() {
		this.setState({ focus: false })
	}

	public render() {
		const errMessage = this.hasErrorsMessage()
		const { label, multiline, secureTextEntry, editable } = this.props
		const { focus } = this.state
		const { style = multiline ? styles.textInputMulti : styles.textInput } = this.props
		const underlineColor = CommonStyles.inputBackColor
		const borderBottomColor = focus ? "#00bcda" : errMessage.length > 0 ? CommonStyles.errorColor : "#DCDDE0"

		return (
			<Row marginTop={layoutSize.LAYOUT_2} marginBottom={layoutSize.LAYOUT_2}>
				<Col
					style={styles.textInputWrapper}
					borderBottomColor={borderBottomColor}
					borderBottomWidth={focus || errMessage.length > 0 ? 2 : 1}
				>
					<TextInput
						autoCapitalize="none"
						editable={editable}
						underlineColorAndroid={underlineColor}
						style={style}
						placeholderTextColor={CommonStyles.placeholderColor}
						placeholder={label}
						multiline={multiline}
						secureTextEntry={secureTextEntry}
						onChangeText={value => this.onChangeText(value)}
						onBlur={() => this.onBlur()}
						onFocus={() => this.onFocus()}
						value={this.state.value}
					/>
				</Col>
				{errMessage.length > 0 && (
					<Row>
						<Text style={styles.inputError}>{errMessage}</Text>
					</Row>
				)}
			</Row>
		)
	}
}
