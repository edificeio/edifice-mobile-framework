import React, { useEffect, useState } from 'react';
import { View, ViewStyle } from 'react-native';

import { BottomSheetModal as RNBottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation, useRoute } from '@react-navigation/native';

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
import { ModalsRouteNames } from '~/framework/navigation/modals';
import { IDistantFileWithId } from '~/framework/util/fileHandler';

const MODAL_DISMISS_DELAY = 500;

export default function Attachments(props: AttachmentsProps) {
  const [attachments, setAttachments] = useState<IDistantFileWithId[]>([]);

  const bottomSheetModalRef = React.useRef<RNBottomSheetModal>(null);
  const navigation = useNavigation();
  const route = useRoute();

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

  const onPressAddAttachments = () => {
    if (!props.draftId) return;
    if (props.onPressAddAttachments) props.onPressAddAttachments();
    bottomSheetModalRef.current?.present();
  };

  const navigateToAttachmentImport = (source: 'galery' | 'camera' | 'documents') => {
    bottomSheetModalRef.current?.dismiss();
    setTimeout(() => {
      // ToDo : Modals parma types are enum that prevent type-checking working properly. Use the module route syntax.
      navigation.navigate({
        name: ModalsRouteNames.AttachmentsImport,
        params: {
          draftId: props.draftId,
          redirectTo: route,
          source,
        },
      });
    }, MODAL_DISMISS_DELAY);
  };

  const handleChoosePics = () => navigateToAttachmentImport('galery');
  const handleTakePic = () => navigateToAttachmentImport('camera');
  const handleChooseDocs = () => navigateToAttachmentImport('documents');

  useEffect(() => {
    if (props.attachments) setAttachments(props.attachments);
  }, [props.attachments]);

  const suppContainerStyle: ViewStyle = {
    borderStyle: props.isEditing ? 'dashed' : 'solid',
  };

  const renderBottomSheetMenu = () => {
    return (
      <BottomSheetModal ref={bottomSheetModalRef}>
        <HeaderBottomSheetModal title={I18n.get('attachment-title')} />
        <ActionButtonBottomSheetModal title={I18n.get('pickfile-take')} icon="ui-camera" onPress={handleTakePic} />
        <Separator marginHorizontal={UI_SIZES.spacing.small} marginVertical={UI_SIZES.spacing.minor} />
        <ActionButtonBottomSheetModal title={I18n.get('pickfile-pick')} icon="ui-multimedia" onPress={handleChoosePics} />
        <Separator marginHorizontal={UI_SIZES.spacing.small} marginVertical={UI_SIZES.spacing.minor} />
        <ActionButtonBottomSheetModal title={I18n.get('pickfile-document')} icon="ui-addFile" onPress={handleChooseDocs} />
      </BottomSheetModal>
    );
  };

  return (
    <View style={[styles.container, suppContainerStyle]}>
      {attachments.length > 0 ? (
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
          action={onPressAddAttachments}
        />
      ) : null}
      {renderBottomSheetMenu()}
    </View>
  );
}
