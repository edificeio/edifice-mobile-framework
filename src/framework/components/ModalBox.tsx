import * as React from 'react';
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import NativeModal from 'react-native-modal';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';
import { Picture } from './picture';

export interface ModalBoxProps {
  content: JSX.Element;
}

export const ModalBox = ({ content }: ModalBoxProps, ref) => {
  const [showModal, setShowModal] = React.useState(false);
  const doShowModal = () => setShowModal(true);
  React.useImperativeHandle(ref, () => ({ doShowModal }));

  return (
    <NativeModal
      useNativeDriver
      useNativeDriverForBackdrop
      isVisible={showModal}
      onBackdropPress={() => setShowModal(false)}
      style={{
        marginHorizontal: UI_SIZES.spacing.large,
        marginTop: UI_SIZES.screen.topInset + UI_SIZES.elements.navbarHeight + UI_SIZES.spacing.large,
        marginBottom: UI_SIZES.screen.bottomInset + UI_SIZES.elements.tabbarHeight + UI_SIZES.spacing.large,
      }}>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.color.background.card,
          borderRadius: UI_SIZES.radius.extraLarge,
          padding: UI_SIZES.spacing.extraLarge,
        }}>
        {content}
        <View
          style={{
            position: 'absolute',
            top: UI_SIZES.spacing.large,
            right: UI_SIZES.spacing.large,
          }}>
          <TouchableOpacity onPress={() => setShowModal(false)}>
            <Picture
              type="NamedSvg"
              name={'pictos-close'}
              width={UI_SIZES.dimensions.width.large}
              height={UI_SIZES.dimensions.height.large}
              fill={theme.greyPalette.black}
            />
          </TouchableOpacity>
        </View>
      </View>
    </NativeModal>
  );
};

export default React.forwardRef(ModalBox);
