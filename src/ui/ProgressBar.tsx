import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { UI_SIZES } from '~/framework/components/constants';

interface ProgressBarProps {
  value: number;
}

const styles = StyleSheet.create({
  loading: {
    backgroundColor: '#30ff30',
    height: 3,
  },
});

class ProgressBar extends React.Component<ProgressBarProps> {
  public render() {
    const { value } = this.props;
    const width = value ? (value * UI_SIZES.screen.width) / 100 : 0;

    return value > 0 ? <View style={[styles.loading, { width }]} /> : <View />;
  }
}

const mapStateToProps = (state: any) => ({
  value: [state.progress.value],
});

export default connect(mapStateToProps)(ProgressBar);
