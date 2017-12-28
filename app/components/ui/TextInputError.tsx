import * as React from 'react'
import {Text, ScrollView, TextInput} from 'react-native'
import styles, { inputBackColor, placeholderColor } from '../styles/index'
import { Col, Row } from '..'
import { layoutSize } from '../../constants/layoutSize'

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
    value: string,
    showDescription: boolean,
    focus: boolean
}

export class TextInputError extends React.Component<TextInputErrorProps, TextInputErrorState> {

  static defaultProps = {
    editable: true,
    error: {
      code: 0,
      message: '',
    },
    errCodes: [],
    label: '',
    multiline: false,
    onChange: (val) => (val),
    onFocus: () => (1),
    secureTextEntry: false,
    value: '',
  }

  state : TextInputErrorState = {
      value: this.props.value,
      showDescription: false,
      focus: false,
  }


  onChangeText(value) {
    if (value === undefined) return

    this.setState({ value })
    this.props.onChange(value)
  }

  hasErrorsMessage() : string {
    const { code, message = '' } = this.props.error
    const { errCodes = [] } = this.props

    if (code !== 0 && errCodes.indexOf(code) >= 0) return message

    return ''
  }

  onFocus() {
      this.setState( {focus: true})
      this.props.onFocus()
  }

  onBlur() {
      this.setState( {focus: false})
  }

  render() {
    const errMessage = this.hasErrorsMessage()
    const { label, multiline, secureTextEntry, editable } = this.props
    const {focus} = this.state
    const styleWrapper = errMessage.length > 0 ? styles.textInputErrorWrapper : styles.textInputWrapper
    const { style = multiline ? styles.textInputMulti : styles.textInput } = this.props
    const underlineColor = inputBackColor
    const borderBottomColor =  focus ? '#00bcda' : errMessage.length > 0 ? 'red' : '#cccccc'


    return (
      <Row marginTop={layoutSize.LAYOUT_2} marginBottom={layoutSize.LAYOUT_2}>
          <Col style={styleWrapper} borderBottomColor={borderBottomColor} borderBottomWidth={focus || errMessage.length > 0 ? 2 : 1}>
            <TextInput
              autoCapitalize="none"
              editable={editable}
              underlineColorAndroid={underlineColor}
              style={style}
              placeholderTextColor={placeholderColor}
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
