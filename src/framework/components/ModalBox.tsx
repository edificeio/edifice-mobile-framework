import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import NativeModal from 'react-native-modal';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';
import { Picture } from './picture';

export interface ModalBoxProps {
  content: JSX.Element;
}

export interface ModalBoxHandle {
  doShowModal: () => void;
  doDismissModal: () => void;
}

export const ModalBox = React.forwardRef<ModalBoxHandle, ModalBoxProps>(({ content }, ref) => {
  const [showModal, setShowModal] = React.useState(false);
  const doDismissModal = () => setShowModal(false);
  const doShowModal = () => setShowModal(true);
  React.useImperativeHandle(ref, () => ({ doShowModal, doDismissModal }));

  return (
    <NativeModal
      useNativeDriver
      useNativeDriverForBackdrop
      isVisible={showModal}
      onBackdropPress={doDismissModal}
      style={ModalBox.styles.nativeModal}>
      <View style={ModalBox.styles.outerView}>
        {content}
        <View style={ModalBox.styles.innerView}>
          <TouchableOpacity onPress={doDismissModal}>
            <Picture
              type="NamedSvg"
              name="pictos-close"
              width={UI_SIZES.dimensions.width.large}
              height={UI_SIZES.dimensions.height.large}
              fill={theme.palette.grey.black}
            />
          </TouchableOpacity>
        </View>
      </View>
    </NativeModal>
  );
});
ModalBox.styles = StyleSheet.create({
  nativeModal: {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    paddingVertical: 43, // Some magic number here. A negative margin of this value seems to be applied automatically by NativeModal.
    flex: 0,
  },
  outerView: {
    flexGrow: 0,
    backgroundColor: theme.ui.background.card,
    borderRadius: UI_SIZES.radius.extraLarge,
    padding: UI_SIZES.spacing.big,
    marginHorizontal: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.elements.navbarHeight + UI_SIZES.screen.topInset,
    marginBottom: UI_SIZES.screen.bottomInset + UI_SIZES.elements.tabbarHeight,
  },
  innerView: {
    position: 'absolute',
    top: UI_SIZES.spacing.medium,
    right: UI_SIZES.spacing.medium,
  },
});

export default ModalBox;
