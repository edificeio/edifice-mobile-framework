import * as React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import ModalBox, { ModalBoxHandle } from '~/framework/components/ModalBox';
import ActionButton from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { ISession } from '~/framework/modules/auth/model';
import { zimbraService } from '~/framework/modules/zimbra/service';

const styles = StyleSheet.create({
  textInput: {
    marginVertical: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.minor,
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.ui.border.input,
    borderWidth: 1,
    borderRadius: 5,
    color: theme.ui.text.regular,
  },
});

interface ICreateFolderModalProps {
  session?: ISession;
  creationCallback: () => void;
}

const CreateFolderModal = React.forwardRef<ModalBoxHandle, ICreateFolderModalProps>((props, ref) => {
  const [name, setName] = React.useState<string>('');
  const [isCreating, setCreating] = React.useState<boolean>(false);

  const createFolder = async () => {
    try {
      const { session } = props;

      setCreating(true);
      if (!session) throw new Error();
      await zimbraService.folder.create(session, name);
      props.creationCallback();
      setCreating(false);
      setName('');
      Toast.showInfo(I18n.get('zimbra-maillist-createfoldermodal-successmessage'));
    } catch {
      setCreating(false);
      Toast.showError(I18n.get('zimbra-maillist-createfoldermodal-error-text'));
    }
  };

  return (
    <ModalBox
      ref={ref}
      content={
        <View>
          <BodyText>{I18n.get('zimbra-maillist-createfoldermodal-title')}</BodyText>
          <TextInput value={name} onChangeText={value => setName(value)} autoFocus style={styles.textInput} />
          <ActionButton
            text={I18n.get('zimbra-maillist-createfoldermodal-action')}
            action={createFolder}
            disabled={!name}
            loading={isCreating}
          />
        </View>
      }
    />
  );
});

export default CreateFolderModal;
