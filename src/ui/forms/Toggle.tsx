import * as React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import styled from '@emotion/native';

import theme from '~/app/theme';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

const styles = StyleSheet.create({
  container: {
    height: 22,
    width: 40,
  },
});

const TapCircle = styled(TouchableOpacity)<{ checked: boolean }>(
  {
    alignItems: 'center',
    backgroundColor: theme.ui.background.card,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 2,
    height: 22,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 0,
    width: 22,
  },
  ({ checked = false }) => ({
    borderColor: checked ? theme.palette.primary.regular : theme.palette.grey.grey,
  })
);

const Container = styled(TouchableOpacity)<{ checked: boolean }>(
  {
    alignItems: 'center',
    borderColor: theme.palette.grey.cloudy,
    borderRadius: 14,
    height: 22,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 0,
    width: 40,
  },
  ({ checked = false }) => ({
    backgroundColor: checked ? theme.palette.primary.regular : theme.palette.grey.cloudy,
    borderColor: checked ? theme.palette.primary.regular : theme.palette.grey.grey,
    borderWidth: checked ? 0 : 1,
  })
);

export class Toggle extends React.Component<
  { checked: boolean; testID?: string; onUncheck?: () => void; onCheck?: () => void },
  { positionAnim: any }
> {
  constructor(props) {
    super(props);

    this.state = {
      positionAnim: new Animated.Value(props.checked ? 20 : 0),
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.checked !== prevProps.checked) {
      Animated.timing(this.state.positionAnim, {
        duration: 500,
        toValue: this.props.checked ? 20 : 0,
        useNativeDriver: false,
      }).start();
    }
  }

  switchCheck() {
    if (this.props.checked) this.props?.onUncheck?.();
    else this.props?.onCheck?.();
  }

  render() {
    return (
      <View style={styles.container} {...(this.props.testID ? { testID: this.props.testID } : {})}>
        <Container onPress={() => this.switchCheck()} checked={this.props.checked} />
        <Animated.View style={{ left: this.state.positionAnim }}>
          <TapCircle onPress={() => this.switchCheck()} checked={this.props.checked} />
        </Animated.View>
      </View>
    );
  }
}
