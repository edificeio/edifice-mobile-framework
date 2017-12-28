import * as React from 'react'
import { Text, View } from 'react-native'
import { errorAlreadyCatched } from '../../constants/errFormInput'
import styles from '../styles/index'

type State = {
  code: number,
  displayMsg: boolean,
  message: string,
}

/**
 *
 * @param error
 * @constructor
 */
export class StatusAlert extends React.Component< {}, State> {
  state = {
    code: 0,
    displayMsg: false,
    message: undefined,
  }

  componentWillReceiveProps(newProps) {
    const { code, message } = this.getMessage(newProps)
    if (message && !this.state.displayMsg) {
      this.setState({ code: code, displayMsg: true, message: message })
      setTimeout(() => this.setState({ displayMsg: false }), 6000)
    }
  }

  getMessage(props) {
    if (!props.messages || props.messages.length === 0) return { code: 0, message: false }
    let { code = 0, message = '' } =
      props.messages[0].errors && props.messages[0].errors.length > 0 ? props.messages[0].errors[0] : props.messages[0]

    if (errorAlreadyCatched(code) || message.length === 0) return { code, message: false }

    return { code, message }
  }

  render() {
    const { code, displayMsg, message } = this.state
    if (
      !displayMsg ||
      message.indexOf('Bienvenue, vous avez accès à toutes') === 0 ||
      message.indexOf('Cette application est réservée aux abonnés Premium') === 0
    )
      return <View />

    const style = code >= 0 && code <= 400 ? styles.containerInfoText : styles.containerErrorText

    return (
      <View style={styles.containerInfo}>
        <Text style={style}>{message}</Text>
      </View>
    )
  }
}
