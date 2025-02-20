import React, { useState } from 'react';
import { View, ViewStyle } from 'react-native';

import { BottomSheetModal as RNBottomSheetModal } from '@gorhom/bottom-sheet';

import Attachment from './attachment';
import styles from './styles';
import { AttachmentsProps } from './types';

import { I18n } from '~/app/i18n';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { UI_SIZES } from '~/framework/components/constants';
import BottomSheetModal from '~/framework/components/modals/bottom-sheet';
import ActionButtonBottomSheetModal from '~/framework/components/modals/bottom-sheet/action-button';
import HeaderBottomSheetModal from '~/framework/components/modals/bottom-sheet/header';
import Separator from '~/framework/components/separator';
import toast from '~/framework/components/toast';
import { IDistantFileWithId } from '~/framework/util/fileHandler';

export default function Attachments(props: AttachmentsProps) {
  const [attachments, setAttachments] = useState<IDistantFileWithId[]>(props.attachments ?? []);

  const bottomSheetModalRef = React.useRef<RNBottomSheetModal>(null);

  // const addAttachment = async attachment => {
  //   try {
  //     if (!props.addAttachmentAction) return;
  //     const attachmentLoaded = await props.addAttachmentAction(attachment);
  //     setAttachments(attachments => [...attachments, attachmentLoaded]);
  //   } catch (e) {
  //     console.error(e);
  //     toast.showError(I18n.get('attachment-adderror'));
  //   }
  // };

  const removeAttachment = async attachment => {
    try {
      if (!props.removeAttachmentAction) return;
      await props.removeAttachmentAction(attachment);
      setAttachments(attachments => attachments.filter(a => a.id !== attachment.id));
    } catch (e) {
      console.error(e);
      toast.showError(I18n.get('attachment-removeerror'));
    }
  };

  const suppContainerStyle: ViewStyle = {
    borderStyle: props.isEditing ? 'dashed' : 'solid',
  };

  const renderBottomSheetMenu = () => {
    return (
      <BottomSheetModal ref={bottomSheetModalRef}>
        <HeaderBottomSheetModal title={I18n.get('attachment-title')} />
        <ActionButtonBottomSheetModal title={I18n.get('pickfile-take')} icon="ui-camera" onPress={() => {}} />
        <Separator marginHorizontal={UI_SIZES.spacing.small} marginVertical={UI_SIZES.spacing.minor} />
        <ActionButtonBottomSheetModal title={I18n.get('pickfile-pick')} icon="ui-multimedia" onPress={() => {}} />
        <Separator marginHorizontal={UI_SIZES.spacing.small} marginVertical={UI_SIZES.spacing.minor} />
        <ActionButtonBottomSheetModal title={I18n.get('pickfile-document')} icon="ui-addFile" onPress={() => {}} />
      </BottomSheetModal>
    );
  };

  return (
    <View style={[styles.container, suppContainerStyle]}>
      {attachments ? (
        <View style={styles.attachments}>
          {attachments.map(attachment => (
            <Attachment
              session={props.session}
              data={attachment}
              isEditing={props.isEditing}
              key={attachment.id}
              removeAttachment={removeAttachment}
            />
          ))}
        </View>
      ) : null}
      {props.isEditing ? (
        <TertiaryButton
          iconLeft="ui-plus"
          text={I18n.get('attachment-attachments')}
          style={styles.button}
          action={() => bottomSheetModalRef.current?.present()}
        />
      ) : null}
      {renderBottomSheetMenu()}
    </View>
  );
}
