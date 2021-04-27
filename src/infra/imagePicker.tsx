import * as React from "react";
import I18n from "i18n-js";
import { CameraOptions, ImageLibraryOptions, ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { TouchableOpacity } from "react-native-gesture-handler";
import { ModalBox, ModalContent, ModalContentBlock } from "../ui/Modal";
import { ButtonTextIcon } from "../ui";
import type { GestureResponderEvent, TouchableOpacityProps } from "react-native";

export type ImagePicked = Required<Pick<ImagePickerResponse, 'uri' | 'type' | 'fileName' | 'fileSize' | 'base64' | 'width' | 'height'>>;

export class ImagePicker extends React.PureComponent<{
    callback: (image: ImagePicked) => void;
    options?: Partial<ImageLibraryOptions & CameraOptions>
} & TouchableOpacityProps, {
    showModal: boolean
}> {

    state = { showModal: false };

    render() {
        const { callback, options, ...props } = this.props;
        const menuActions = [{
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
        }];

        const realCallback = (image: ImagePickerResponse) => {
            // console.log("picker returns", image);
            !image.didCancel && !image.errorCode && !image.errorMessage && image.uri && callback(image as ImagePicked);
            this.setState({ showModal: false })
        };

        const actions = {
            'camera': () => {
                launchCamera({
                    ...options,
                    mediaType: 'photo',
                }, realCallback);
            },
            'gallery': () => {
                launchImageLibrary({
                    ...this.props.options,
                    mediaType: 'photo'
                }, realCallback);
            },
            'cancel': () => {
                this.setState({ showModal: false });
            }
        }

        return <>
            <ModalBox backdropOpacity={0.5} isVisible={this.state.showModal}><ModalContent>
                {menuActions.map(a => <ModalContentBlock>
                    <ButtonTextIcon title={a.title} onPress={() => {
                        actions[a.id]();
                    }}></ButtonTextIcon>
                </ModalContentBlock>)}
            </ModalContent>
            </ModalBox>
            <TouchableOpacity {...props} disallowInterruption={true} onPress={(event: GestureResponderEvent) => {
                this.setState({ showModal: true }); props.onPress && props.onPress(event)
            }}>{this.props.children}</TouchableOpacity>
        </>;
    }
}