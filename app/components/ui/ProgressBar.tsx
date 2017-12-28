import * as React from 'react'
import { View } from 'react-native'
import styles, { deviceWidth } from '../styles/index'

function isLoading(isLoadings) {
  if (isLoadings === undefined) return false
  return isLoadings.reduce((acc, elemIsLoading) => acc || elemIsLoading, false)
}

interface ProgressBarState {
    width?: number
    isLoading?: boolean
};

export interface ProgressBarProps {
    isLoadings: boolean[]
};


export class ProgressBar extends React.Component< ProgressBarProps, ProgressBarState> {
  state : ProgressBarState = {
      width: 0,
      isLoading: false,
  }
  timerID = 0


  componentWillReceiveProps(newProps) {
    if (isLoading(newProps.isLoadings)) {
      this.timerID = setInterval(
        () => this.setState({ width: (this.state.width + deviceWidth / 10) % deviceWidth }),
        400
      )
    }

    if (!isLoading(newProps.isLoadings)) {
      clearInterval(this.timerID)
    }
  }

  render() {
    const { isLoadings } = this.props

    return isLoading(isLoadings) ? <View style={[styles.loading, { width: this.state.width }]} /> : <View />
  }
}

