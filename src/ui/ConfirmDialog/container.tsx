import React from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import AnimatedModal from 'react-native-modal';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { layoutSize } from '~/styles/common/layoutSize';

const styles = StyleSheet.create({
  modal: {
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'column',
    borderRadius: 3,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
    marginVertical: 0,
    marginHorizontal: UI_SIZES.spacing.small,
    backgroundColor: theme.palette.grey.white,
    overflow: 'hidden',
    elevation: 4,
    minWidth: 300,
  },
  header: {
    margin: UI_SIZES.spacing.tiny,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: UI_SIZES.spacing.tiny,
    padding: UI_SIZES.spacing.minor,
  },
});

type IProps = {
  visible: boolean;
};

export default class DialogContainer extends React.PureComponent<IProps> {
  static defaultProps = {
    visible: false,
  };

  render() {
    const { children, visible, ...otherProps } = this.props;
    const titleChildrens = [];
    const buttonChildrens = [];
    const otherChildrens = [];
    React.Children.forEach<any>(children, child => {
      if (!child) {
        return;
      }
      if (child.type.name === 'DialogTitle' || child.type.displayName === 'DialogTitle') {
        titleChildrens.push(child as never);
      } else if (String(child.type.name).startsWith('DialogButton')) {
        buttonChildrens.push(child as never);
      } else {
        otherChildrens.push(child as never);
      }
    });
    return (
      <AnimatedModal backdropOpacity={0.3} style={styles.modal} isVisible={visible} backdropTransitionOutTiming={0} {...otherProps}>
        <KeyboardAvoidingView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.header}>{titleChildrens}</View>
            {otherChildrens}
            {Boolean(buttonChildrens.length) && (
              <View style={styles.footer}>
                {buttonChildrens.map((x, i) =>
                  React.cloneElement(x, {
                    key: `dialog-button-${i}`,
                  }),
                )}
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </AnimatedModal>
    );
  }
}
