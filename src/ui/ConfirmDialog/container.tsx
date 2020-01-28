import React from "react";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import AnimatedModal from "react-native-modal";
import {layoutSize} from "../../styles/common/layoutSize";

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
    React.Children.forEach(children, child => {
      if (!child) {
        return;
      }
      if (child.type.name === "DialogTitle" || child.type.displayName === "DialogTitle") {
        titleChildrens.push(child);
      } else if (child.type.name === "DialogButton" || child.type.displayName === "DialogButton") {
        buttonChildrens.push(child);
      } else {
        otherChildrens.push(child);
      }
    });
    return (
      <AnimatedModal
        backdropOpacity={0.3}
        style={styles.modal}
        isVisible={visible}
        backdropTransitionOutTiming={0}
        {...otherProps}>
        <KeyboardAvoidingView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.header}>{titleChildrens}</View>
            {otherChildrens}
            {Boolean(buttonChildrens.length) && (
              <View style={styles.footer}>
                {buttonChildrens.map((x, i) =>
                  React.cloneElement(x, {
                    key: `dialog-button-${i}`,
                  })
                )}
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </AnimatedModal>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  blur: {
    position: "absolute",
    backgroundColor: "rgb(255,255,255)",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  content: {
    flexDirection: "column",
    borderRadius: 3,
    paddingHorizontal: layoutSize.LAYOUT_12,
    paddingVertical: layoutSize.LAYOUT_8,
    marginVertical: layoutSize.LAYOUT_0,
    marginHorizontal: layoutSize.LAYOUT_12,
    backgroundColor: "white",
    overflow: "hidden",
    elevation: 4,
    minWidth: 300,
  },
  header: {
    margin: layoutSize.LAYOUT_4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    padding: layoutSize.LAYOUT_8,
  },
  buttonSeparator: {
    height: "100%",
    backgroundColor: "#A9ADAE",
    width: StyleSheet.hairlineWidth,
  },
});
