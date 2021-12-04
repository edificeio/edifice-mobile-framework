import I18n from 'i18n-js';
import * as React from 'react';
import type { GestureResponderEvent, TouchableOpacityProps } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Asset, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';

import { LocalFile } from '~/framework/util/fileHandler';
import { ButtonTextIcon } from '~/ui';
import { ModalBox, ModalContent, ModalContentBlock } from '~/ui/Modal';

export type ImagePicked = Required<Pick<Asset, 'uri' | 'type' | 'fileName' | 'fileSize' | 'base64' | 'width' | 'height'>>;

export class ImagePicker extends React.PureComponent<
  {
    callback: (image: ImagePicked) => void;
    options?: Partial<ImageLibraryOptions & CameraOptions>;
    multiple?: boolean;
  } & TouchableOpacityProps,
  {
    showModal: boolean;
  }
> {
  state = { showModal: false };

  render() {
    const { callback, options, multiple, ...props } = this.props;
    const menuActions = [
      {
        id: 'camera',
        title: I18n.t('common-photoPicker-take'),
      },
      {
        id: 'gallery',
        title: I18n.t('common-photoPicker-pick'),
      },
      {
        id: 'cancel',
        title: I18n.t('Cancel'),
      },
    ];

    const realCallback = (images: LocalFile[]) => {
      for (const img of images) {
        const imgFormatted = {
          ...img.nativeInfo,
          ...img,
        };
        callback(imgFormatted as ImagePicked);
      }
      this.setState({ showModal: false });
    };

    const actions = {
      camera: async () => {
        try {
          // await assertPermissions('camera');
          // launchCamera({ ...options, mediaType: 'photo' }, realCallback);
          LocalFile.pick({ source: 'camera' }).then(realCallback);
        } catch (error) {
          console.error(error);
        }
      },
      gallery: async () => {
        try {
          // await assertPermissions('galery.read');
          // launchImageLibrary({ ...this.props.options, mediaType: 'photo' }, realCallback);
          LocalFile.pick({ source: 'galery', multiple }).then(realCallback);
        } catch (error) {
          console.error(error);
        }
      },
      cancel: () => {
        this.setState({ showModal: false });
      },
    };

    return (
      <>
        <ModalBox backdropOpacity={0.5} isVisible={this.state.showModal}>
          <ModalContent>
            {menuActions.map(a => (
              <ModalContentBlock style={{ marginBottom: 20 }}>
                <ButtonTextIcon
                  style={{ width: 250 }}
                  textStyle={{ fontSize: 18, padding: 15, marginTop: -10 }}
                  title={a.title}
                  onPress={() => {
                    actions[a.id]();
                  }}
                />
              </ModalContentBlock>
            ))}
          </ModalContent>
        </ModalBox>
        <TouchableOpacity
          {...props}
          disallowInterruption
          onPress={(event: GestureResponderEvent) => {
            this.setState({ showModal: true });
            props.onPress && props.onPress(event);
          }}>
          {this.props.children}
        </TouchableOpacity>
      </>
    );
  }
}

export const imagePickedToLocalFile = (img: ImagePicked) =>
  new LocalFile(
    {
      filename: img.fileName as string,
      filepath: img.uri as string,
      filetype: img.type as string,
    },
    { _needIOSReleaseSecureAccess: false },
  );
