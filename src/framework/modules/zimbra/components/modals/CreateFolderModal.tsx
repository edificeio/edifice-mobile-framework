import * as React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import ModalBox, { ModalBoxHandle } from '~/framework/components/ModalBox';
import { BodyText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { zimbraService } from '~/framework/modules/zimbra/service';

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.ui.border.input,
    borderRadius: 5,
    borderWidth: 1,
    color: theme.ui.text.regular,
    marginVertical: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.minor,
  },
});

interface ICreateFolderModalProps {
  session?: AuthLoggedAccount;
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
          <PrimaryButton
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
