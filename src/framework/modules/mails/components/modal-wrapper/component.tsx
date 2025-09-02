import * as React from 'react';
import { Modal, TouchableWithoutFeedback, View } from 'react-native';

import styles from './styles';
import { ModalWrapperProps } from './types';

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  animationType = 'slide',
  children,
  closeOnOverlayPress = false,
  isVisible,
  onClose,
  presentationStyle = 'overFullScreen',
}) => {
  const handleOverlayPress = React.useCallback(() => {
    if (closeOnOverlayPress) {
      onClose();
    }
  }, [onClose, closeOnOverlayPress]);

  return (
    <Modal
      visible={isVisible}
      animationType={animationType}
      presentationStyle={presentationStyle}
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <View style={styles.touchableOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.content}>{children}</View>
      </View>
    </Modal>
  );
};
