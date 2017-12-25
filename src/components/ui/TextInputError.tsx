import * as React from 'react'
import {Text, TextInput} from 'react-native'
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

export class TextInputError extends React.Component<TextInputErrorProps, any> {

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

  state = {
      value: this.props.value,
      showDescription: false,
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

  render() {
    const errMessage = this.hasErrorsMessage()
    const {
      label,
      multiline,
      secureTextEntry,
      editable,
      onFocus,
    } = this.props
    const styleWrapper = errMessage.length > 0 ? styles.textInputErrorWrapper : styles.textInputWrapper
    const { style = multiline ? styles.textInputMulti : styles.textInput } = this.props
    const underlineColor = errMessage.length > 0 ? 'red' : inputBackColor

    return (
      <Row marginTop={layoutSize.LAYOUT_2} marginBottom={layoutSize.LAYOUT_2}>
        <Row>
          <Col style={styleWrapper}>
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
              onFocus={() => onFocus()}
              value={this.state.value}
            />
          </Col>
        </Row>
        {errMessage.length > 0 && (
          <Row>
            <Text style={styles.inputError}>{errMessage}</Text>
          </Row>
        )}
      </Row>
    )
  }
}
