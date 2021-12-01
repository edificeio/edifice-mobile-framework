import getPath from '@flyerhq/react-native-android-uri-path';
import I18n from 'i18n-js';
import * as React from 'react';
import { GestureResponderEvent, Platform, TouchableOpacityProps } from 'react-native';
import DocumentPicker, {
  DocumentPickerOptions,
  DocumentPickerResponse,
  DocumentType,
  PlatformTypes,
} from 'react-native-document-picker';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Asset, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';

import { LocalFile } from '~/framework/util/fileHandler';
import { assertPermissions } from '~/framework/util/permissions';
import { ButtonTextIcon } from '~/ui';
import { ModalBox, ModalContent, ModalContentBlock } from '~/ui/Modal';

export type ImagePicked = Required<Pick<Asset, 'uri' | 'type' | 'fileName' | 'fileSize' | 'base64' | 'width' | 'height'>>;
export type DocumentPicked = Required<Pick<DocumentPickerResponse, 'uri' | 'type'>> & {
  fileName: string;
  fileSize: number;
};

export class FilePicker extends React.PureComponent<
  {
    callback: (document: ImagePicked | DocumentPicked, sourceType?: string) => void;
    options?: Partial<ImageLibraryOptions & CameraOptions & DocumentPickerOptions<keyof PlatformTypes>>;
    multiple?: boolean;
  } & TouchableOpacityProps,
  {
    showModal: boolean;
  }
> {
  state = { showModal: false };

  render() {
    const { callback, options, multiple, ...props } = this.props;

    const imageCallback = (images: LocalFile[], sourceType: string) => {
      for (const img of images) {
        const imgFormatted = {
          ...img.nativeInfo,
          ...img,
        };
        callback(imgFormatted as ImagePicked);
      }
      this.setState({ showModal: false });
    };

    const documentCallback = async (files: DocumentPickerResponse[], sourceType: string) => {
      for (const file of files) {
        file.uri = Platform.select({
          android: getPath(file.uri),
          default: decodeURI(file.uri.indexOf('file://') > -1 ? file.uri.split('file://')[1] : file.uri),
        });
        callback({ fileName: file.name, fileSize: file.size!, uri: file.uri, type: file.type }, sourceType);
      }
      this.setState({ showModal: false });
    };

    const menuActions = [
      {
        id: 'camera',
        title: I18n.t('common-photoPicker-take'),
        action: async (sourceType: string) => {
          LocalFile.pick({ source: 'camera' }).then(lf => imageCallback(lf, sourceType));
        },
      },
      {
        id: 'gallery',
        title: I18n.t('common-photoPicker-pick'),
        action: async (sourceType: string) => {
          LocalFile.pick({ source: 'galery', multiple }).then(lf => imageCallback(lf, sourceType));
        },
      },
      {
        id: 'document',
        title: I18n.t('common-picker-document'),
        action: async (sourceType: string) => {
          await assertPermissions('documents.read');
          DocumentPicker.pick({
            type: DocumentPicker.types.allFiles as
              | PlatformTypes[keyof PlatformTypes][keyof PlatformTypes[keyof PlatformTypes]][]
              | DocumentType[keyof PlatformTypes],
            ...options,
          }).then(file => documentCallback(file, sourceType));
        },
      },
      {
        id: 'cancel',
        title: I18n.t('Cancel'),
        action: (sourceType: string) => {
          this.setState({ showModal: false });
        },
      },
    ];

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
                    // console.log("clicked", a.id);
                    a.action(a.id);
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
