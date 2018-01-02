import * as React from "react"
import {StyleSheet, Text, TextInput} from "react-native"
import { Col, Row } from ".."
import { layoutSize } from "../../constants/layoutSize"
import {CommonStyles} from "../styles/common/styles";

const styles = StyleSheet.create( {
    inputError: {
        color: "red",
        fontSize: layoutSize.LAYOUT_10,
        height: layoutSize.LAYOUT_32,
        fontWeight: "800",
        paddingBottom: 0,
        marginBottom: 0,
    },
    textInput: {
        color: CommonStyles.textInputColor,
        fontSize: layoutSize.LAYOUT_10,
        height: layoutSize.LAYOUT_32,
        paddingBottom: 0,
        marginBottom: 0,
    },
    textInputErrorWrapper: {
        backgroundColor: CommonStyles.inputBackColor,
        borderColor: CommonStyles.errorColor,
        borderRadius: 3,
        borderWidth: 1,
        paddingBottom: 0,
    },
    textInputMulti: {
        color: CommonStyles.textInputColor,
        fontSize: layoutSize.LAYOUT_10,
        height: layoutSize.LAYOUT_60,
    },
    textInputWrapper: {
        backgroundColor: CommonStyles.inputBackColor,
        borderBottomColor: CommonStyles.borderColor,
        borderBottomWidth: 1,
        paddingBottom: 0,
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
		const styleWrapper = errMessage.length > 0 ? styles.textInputErrorWrapper : styles.textInputWrapper
		const { style = multiline ? styles.textInputMulti : styles.textInput } = this.props
		const underlineColor = CommonStyles.inputBackColor
		const borderBottomColor = focus ? "#00bcda" : errMessage.length > 0 ? "red" : "#cccccc"

		return (
			<Row marginTop={layoutSize.LAYOUT_2} marginBottom={layoutSize.LAYOUT_2}>
				<Col
					style={styleWrapper}
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
