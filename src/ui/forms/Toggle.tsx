import style from 'glamorous-native';
import * as React from 'react';
import { View, Animated } from 'react-native';

import theme from '~/app/theme';
import { CommonStyles } from '~/styles/common/styles';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

const TapCircle = style(TouchableOpacity)(
  {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: 22,
    height: 22,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: 0,
    top: 0,
    borderWidth: 1,
    elevation: 2,
  },
  ({ checked = false }) => ({
    borderColor: checked ? theme.color.secondary.regular : '#DDDDDD',
  }),
);

const Container = style(TouchableOpacity)(
  {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 22,
    borderColor: '#dddddd',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  ({ checked = false }) => ({
    backgroundColor: checked ? theme.color.secondary.regular : '#efefef',
    borderColor: checked ? CommonStyles.primary : '#DDDDDD',
    borderWidth: checked ? 0 : 1,
  }),
);

export class Toggle extends React.Component<
  { checked: boolean; onUncheck?: () => void; onCheck?: () => void },
  { positionAnim: any }
> {
  constructor(props) {
    super(props);

    this.state = {
      positionAnim: new Animated.Value(props.checked ? 20 : 0),
    };
  }

  UNSAFE_componentWillReceiveProps(newProps, oldProps) {
    if (newProps.checked !== oldProps.checked) {
      Animated.timing(this.state.positionAnim, {
        toValue: newProps.checked ? 20 : 0,
        duration: 500,
      }).start();
    }
  }

  switchCheck() {
    this.props.checked ? this.props.onUncheck && this.props.onUncheck() : this.props.onCheck && this.props.onCheck();
  }

  render() {
    return (
      <View style={{ width: 40, height: 22 }}>
        <Container onPress={() => this.switchCheck()} checked={this.props.checked} />
        <Animated.View style={{ left: this.state.positionAnim }}>
          <TapCircle onPress={() => this.switchCheck()} checked={this.props.checked} />
        </Animated.View>
      </View>
    );
  }
}
