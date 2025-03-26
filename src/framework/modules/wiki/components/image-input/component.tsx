import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { INPUT_BUTTON_COLOR, styles } from './styles';
import { ImageInputProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import ActionButtonBottomSheetModal from '~/framework/components/modals/bottom-sheet/action-button';
import HeaderBottomSheetModal from '~/framework/components/modals/bottom-sheet/header';
import ModuleImage from '~/framework/components/picture/module-image';
import { ModuleImageProps } from '~/framework/components/picture/module-image/types';
import Separator from '~/framework/components/separator';
import ImageInputButton from '~/framework/modules/wiki/components/image-input-button';
import { LocalFile } from '~/framework/util/fileHandler';
import { Asset } from '~/framework/util/fileHandler/types';

const MODULE_IMAGE_FALLBACK_ICON: ModuleImageProps['fallbackIcon'] = {
  fill: theme.palette.grey.graphite,
  name: 'ui-image',
  type: 'Svg',
};

const ImageInput: React.FC<ImageInputProps> = ({ moduleConfig, moduleImageStyle, onChange, style, value: _value }) => {
  const choosePicsMenuRef = React.useRef<BottomSheetModalMethods>(null);
  const value = React.useMemo(() => _value && _value.uri ? {uri: _value.uri!} : undefined, [_value]);

  const mergedModuleImageStyle = React.useMemo(() => [styles.moduleImageContainer, moduleImageStyle], [moduleImageStyle]);

  const hideChoosePicsMenu = React.useCallback(() => {
    choosePicsMenuRef.current?.dismiss();
  }, []);

  const showChoosePicsMenu = React.useCallback(() => {
    choosePicsMenuRef.current?.present();
  }, []);

  const deletePicture = React.useCallback(() => {
    hideChoosePicsMenu();
    onChange?.(undefined);
  }, [hideChoosePicsMenu, onChange]);

  const selectPicFromGallery = React.useCallback(async () => {
    hideChoosePicsMenu();

    try {
      await LocalFile.pickFromGallery(
        (selectedImage: Asset) => {
          onChange?.(selectedImage[0]?.uri);
        },
        false,
        true,
        true,
      );
    } catch (error) {
      console.error('Error picking images from gallery:', error as Error);
    }
  }, [hideChoosePicsMenu, onChange]);

  const takePicWithCamera = React.useCallback(async () => {
    hideChoosePicsMenu();
    try {
      await LocalFile.pickFromCamera(
        (capturedImage: Asset) => {
          onChange?.(capturedImage[0]?.uri);
        },
        false,
        true,
        true,
      );
    } catch (error) {
      console.error('Error taking picture:', error as Error);
    }
  }, [hideChoosePicsMenu, onChange]);

  const ChoosePicsMenu: React.FC = () => {
    return (
      <BottomSheetModal ref={choosePicsMenuRef} onDismiss={hideChoosePicsMenu}>
        <HeaderBottomSheetModal title={value ? I18n.get('wiki-image-change') : I18n.get('pickfile-image')} />
        <ActionButtonBottomSheetModal title={I18n.get('pickfile-take')} icon="ui-camera" onPress={takePicWithCamera} />
        <Separator marginHorizontal={UI_SIZES.spacing.small} marginVertical={UI_SIZES.spacing.minor} />
        <ActionButtonBottomSheetModal title={I18n.get('pickfile-pick')} icon="ui-image" onPress={selectPicFromGallery} />
        {value && (
          <>
            <Separator marginHorizontal={UI_SIZES.spacing.small} marginVertical={UI_SIZES.spacing.minor} />
            <ActionButtonBottomSheetModal title={I18n.get('wiki-image-delete')} icon="ui-delete" onPress={deletePicture} />
          </>
        )}
      </BottomSheetModal>
    );
  };

  return (
    <View style={style}>
      <View style={styles.imageInputContainer}>
        <TouchableOpacity onPress={showChoosePicsMenu}>
          <ModuleImage
            moduleConfig={moduleConfig}
            style={mergedModuleImageStyle}
            source={value}
            fallbackIcon={MODULE_IMAGE_FALLBACK_ICON}
          />
          <ImageInputButton contentColor={INPUT_BUTTON_COLOR} icon={'ui-edit'} />
        </TouchableOpacity>
      </View>
      <ChoosePicsMenu />
    </View>
  );
};

export default ImageInput;
