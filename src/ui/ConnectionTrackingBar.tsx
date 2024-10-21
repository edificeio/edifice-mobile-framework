import * as React from 'react';
import { ActivityIndicator, Animated, View } from 'react-native';

import styled from '@emotion/native';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture';
import { SmallInverseText } from '~/framework/components/text';
import { checkConnection, watchConnection } from '~/infra/actions/connectionTracker';
import { getState as getConnectionTrackerState } from '~/infra/reducers/connectionTracker';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

const TrackingContainer = styled(TouchableOpacity)({
  flex: 1,
  flexDirection: 'row',
});

const container = {
  backgroundColor: theme.ui.background.card,
  elevation: 4,
  width: '100%',
};

export class DEPRECATED_ConnectionTrackingBar extends React.Component<
  {
    connected: boolean;
    watch: () => void;
    check: () => Promise<void>;
    loading: boolean;
    visible: boolean;
    style?: any;
  },
  { fadeAnim; slideAnim }
> {
  previousVisible: boolean;

  state = {
    fadeAnim: new Animated.Value(0),
    slideAnim: new Animated.Value(0),
  };

  componentDidMount() {
    this.props.watch();
    this.animate();
  }

  animate() {
    setTimeout(() => {
      if (this.props.visible && !this.previousVisible) {
        this.previousVisible = true;
        Animated.timing(this.state.fadeAnim, {
          duration: 500,
          toValue: 1,
          useNativeDriver: false,
        }).start();

        Animated.timing(this.state.slideAnim, {
          duration: 500,
          toValue: 40,
          useNativeDriver: false,
        }).start();
      }

      if (!this.props.visible && this.previousVisible && this.props.connected) {
        this.previousVisible = false;
        Animated.timing(this.state.fadeAnim, {
          duration: 500,
          toValue: 0,
          useNativeDriver: false,
        }).start();

        Animated.timing(this.state.slideAnim, {
          duration: 500,
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    }, 200);
  }

  componentDidUpdate() {
    this.animate();
  }

  get iconName(): string {
    if (this.props.loading) {
      return 'loading';
    }
    if (this.props.connected) {
      return 'checked';
    }
    return 'retry';
  }

  get text(): string {
    if (this.props.loading) {
      return 'connectiontrackingbar-connecting';
    }
    if (this.props.connected) {
      return 'connectiontrackingbar-connected';
    }
    return 'connectiontrackingbar-disconnected';
  }

  get barColor(): string {
    if (this.props.loading) {
      return theme.palette.status.warning.regular;
    }
    if (this.props.connected) {
      return theme.palette.status.success.regular;
    }
    return theme.palette.status.failure.regular;
  }

  public render() {
    const { fadeAnim, slideAnim } = this.state;
    return (
      <Animated.View
        style={{
          ...container,
          ...this.props.style,
          height: slideAnim,
          opacity: fadeAnim,
        }}>
        <TrackingContainer style={{ backgroundColor: this.barColor }} onPress={() => this.props.check()}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <SmallInverseText
              style={{
                alignSelf: 'center',
                flex: 1,
                marginLeft: UI_SIZES.spacing.large,
                textAlign: 'center',
              }}>
              {I18n.get(this.text)}
            </SmallInverseText>
            {this.props.loading ? (
              <ActivityIndicator size="small" color={theme.ui.text.inverse} style={{ marginRight: UI_SIZES.spacing.huge }} />
            ) : (
              <Icon
                name={this.iconName}
                size={18}
                style={{ marginRight: UI_SIZES.spacing.medium, marginTop: UI_SIZES.spacing.small }}
                color={theme.ui.text.inverse}
              />
            )}
          </View>
        </TrackingContainer>
      </Animated.View>
    );
  }
}

export default connect(
  (state: IGlobalState) => getConnectionTrackerState(state),
  dispatch => ({
    check: () => checkConnection(dispatch)(),
    watch: () => watchConnection(dispatch)(),
  }),
)(DEPRECATED_ConnectionTrackingBar);
