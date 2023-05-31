import styled from '@emotion/native';
import * as React from 'react';
import {
  ActivityIndicator,
  Animated,
  ColorValue,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  TextLayoutEventData,
  View,
} from 'react-native';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallInverseText } from '~/framework/components/text';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

import type { NotifierState } from './reducer';

const NotifierWrapper = styled(TouchableOpacity)({
  flex: 1,
  flexDirection: 'row',
});

class Notifier extends React.Component<
  {
    id: string;
    notifiers: {
      [key: string]: NotifierState;
    };
    style?: any;
  },
  {
    fadeAnim: Animated.AnimatedValue;
    slideAnim: Animated.AnimatedValue;
    measuredText: boolean;
    longText: boolean;
    notifierHeight: number;
  }
> {
  previousVisible: boolean = false;

  state = {
    fadeAnim: new Animated.Value(0),
    slideAnim: new Animated.Value(0),
    measuredText: false,
    longText: false,
    notifierHeight: 0,
  };

  animate() {
    const { id } = this.props;
    const { notifierHeight, fadeAnim, slideAnim } = this.state;
    const notifier = this.props.notifiers[id];
    const visible = notifier && notifier.visible;

    if (notifierHeight > 0) {
      setTimeout(() => {
        if (visible && !this.previousVisible) {
          this.previousVisible = true;
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }).start();

          Animated.timing(slideAnim, {
            toValue: notifierHeight,
            duration: 500,
            useNativeDriver: false,
          }).start();
        }

        if (!visible && this.previousVisible) {
          this.previousVisible = false;
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }).start();

          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }).start();
        }
      }, 200);
    }
  }

  get barColor(): ColorValue {
    const { id } = this.props;
    const notifier = this.props.notifiers[id];
    const type = (notifier && notifier.notifierType) || 'info';

    return {
      info: theme.palette.complementary.blue.regular,
      success: theme.palette.status.success.regular,
      warning: theme.palette.status.warning.regular,
      error: theme.palette.status.failure.regular,
    }[type];
  }

  public measureText = (evt: NativeSyntheticEvent<TextLayoutEventData>) => {
    const textBlockHeight = evt.nativeEvent.lines[0].height * evt.nativeEvent.lines.length;
    if (evt.nativeEvent.lines.length > 1) {
      this.setState({ measuredText: true, longText: true, notifierHeight: textBlockHeight + 40 });
    } else {
      this.setState({ measuredText: true, longText: false, notifierHeight: 40 });
    }
  };

  componentDidMount() {
    this.animate();
  }

  componentDidUpdate() {
    this.animate();
  }

  public render() {
    const { style, id } = this.props;
    const { fadeAnim, slideAnim, measuredText, longText, notifierHeight } = this.state;
    const notifier = this.props.notifiers[id];

    if (!notifier) return null;

    const loading = notifier && notifier.loading;
    const text = notifier && notifier.text;
    const icon = notifier && notifier.icon;
    const heightIos = measuredText && !longText ? undefined : notifierHeight;
    const height = Platform.OS === 'ios' ? heightIos : undefined;
    const marginLeft = !icon && !loading ? undefined : UI_SIZES.spacing.large;

    const styles = StyleSheet.create({
      outerAnimatedView: {
        ...style,
        width: '100%',
        backgroundColor: theme.palette.grey.white,
        elevation: 6,
        opacity: fadeAnim,
        height: slideAnim,
      },
      innerAnimatedView: { flexDirection: 'row', flex: 1, ...style },
      alignCenter: { alignItems: 'center' },
      textAnimated: {
        flex: 1,
        textAlign: longText ? 'left' : 'center',
        alignSelf: 'center',
        height,
        marginLeft,
        paddingTop: longText ? UI_SIZES.spacing.medium : undefined,
        paddingBottom: longText ? UI_SIZES.spacing.medium : undefined,
      },
    });

    return (
      <Animated.View style={styles.outerAnimatedView}>
        <NotifierWrapper style={{ backgroundColor: this.barColor }}>
          <View style={[styles.innerAnimatedView, icon && !loading && styles.alignCenter]}>
            {text ? (
              <SmallInverseText onTextLayout={this.measureText} style={styles.textAnimated}>
                {text}
              </SmallInverseText>
            ) : null}
            {loading ? (
              <ActivityIndicator size="small" color={theme.ui.text.inverse} style={{ marginRight: UI_SIZES.spacing.big }} />
            ) : icon ? (
              <Icon name={icon} size={18} style={{ marginRight: UI_SIZES.spacing.big }} color={theme.ui.text.inverse} />
            ) : null}
          </View>
        </NotifierWrapper>
      </Animated.View>
    );
  }
}

export default connect((state: any) => ({
  notifiers: state.notifiers,
}))(Notifier);
