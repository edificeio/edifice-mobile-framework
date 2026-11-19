import * as React from 'react';
import { Platform, ScrollView, TextInput, View } from 'react-native';

import { CommonActions, StaticScreenProps, useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';

import { defineScreen, useConfirmRemove } from '~/app/navigation-new';
import theme from '~/app/theme';
import { Attachment } from '~/framework/components/attachment';
import PrimaryButton from '~/framework/components/buttons/primary';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { KeyboardAvoidingView } from '~/framework/components/keyboard';
import { cameraActionFm, documentActionFm, galleryActionFm } from '~/framework/components/menus/actions';
import BottomMenu from '~/framework/components/menus/bottom';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText, NestedBoldText, SmallActionText, SmallBoldText, SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { sendSupportTicket } from '~/framework/modules/support/actions';
import {
  canCreateTicket,
  canSendTicket,
  getStructureChoices,
  getTicketCategories,
} from '~/framework/modules/support/model/business';
import { LocalFile } from '~/framework/util/fileHandler/models';
import { withSession } from '~/modules/auth/hoc';
import { AuthActiveAccount } from '~/modules/auth/model';
import { useEntApps } from '~/modules/myapps/hooks';
import { I18n } from '~/util/i18n';

import styles from './styles';

/** Translation of a key of `support`: `undefined` when there is none (`I18n.get` then gives the key back). */
const translateCategory = (key: string) => {
  const translation = I18n.get(key);
  return translation.startsWith('support-') ? undefined : translation;
};

/** Sources of the attachments, in the menu « add files ». */
const FILE_ACTIONS = [cameraActionFm, galleryActionFm, documentActionFm];

const MANDATORY_TEXT = ' *';

// The screen layout already gives the background. On iOS the form is lifted above the keyboard; Android resizes the window itself
// (`adjustResize`)
const PageComponent: React.ComponentType<React.PropsWithChildren> = Platform.OS === 'ios' ? KeyboardAvoidingView : React.Fragment;

const SupportCreateTicketScreen = ({ session }: { session: AuthActiveAccount }) => {
  const navigation = useNavigation();
  // Labels of the apps translated by the server, loaded by « Mes applis »
  const { apps: entApps } = useEntApps();
  const apps = React.useMemo(() => {
    const serverLabels = new Map(entApps.map(app => [app.name, app.label]));
    return getTicketCategories(session.rights.apps, {
      getServerLabel: appName => serverLabels.get(appName),
      otherLabel: I18n.get('support-createticket-category-other'),
      translate: translateCategory,
    });
  }, [entApps, session]);
  const structures = React.useMemo(() => getStructureChoices(session.user.structures), [session]);
  const hasTicketCreationRights = React.useMemo(() => canCreateTicket(session.rights.authorizedActions), [session]);
  const [isCategoryDropdownOpen, setCategoryDropdownOpen] = React.useState(false);
  const [isStructureDropdownOpen, setStructureDropdownOpen] = React.useState(false);
  const [category, setCategory] = React.useState(apps[0]?.value);
  const [structure, setStructure] = React.useState(structures[0]?.value);
  const [subject, setSubject] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [attachments, setAttachments] = React.useState<LocalFile[]>([]);
  const [isSending, setSending] = React.useState(false);

  const onFilesPicked = React.useCallback((files: LocalFile | LocalFile[]) => {
    setAttachments(prev => [...prev, ...(files as LocalFile[])]);
  }, []);

  const removeAttachment = React.useCallback((filepath: string) => {
    setAttachments(prev => prev.filter(a => a.filepath !== filepath));
  }, []);

  const sendTicket = React.useCallback(async () => {
    try {
      setSending(true);
      const ticketId = await sendSupportTicket(session, { category, description, structure, subject }, attachments);
      navigation.dispatch(CommonActions.goBack());
      Toast.showSuccess(I18n.get('support-createticket-successmessage', { id: ticketId }), {
        testID: 'support-createticket-toast-success',
      });
    } catch {
      setSending(false);
      Toast.showError(I18n.get('support-createticket-errormessage'));
    }
  }, [attachments, category, description, navigation, session, structure, subject]);

  const onCategoryOpen = React.useCallback(() => {
    setStructureDropdownOpen(false);
  }, []);

  const onStructureOpen = React.useCallback(() => {
    setCategoryDropdownOpen(false);
  }, []);

  useConfirmRemove(!!(subject || description) && !isSending, {
    text: I18n.get('support-createticket-leavealert-text'),
    title: I18n.get('support-createticket-leavealert-title'),
  });

  const filesAdded = attachments.length > 0;
  const isActionDisabled = !canSendTicket({ description, subject });
  // Built at each render, never memoized: `BottomMenu` adds its « cancel » action to the array it is given, each time it opens
  const fileActions = FILE_ACTIONS.map(fn => fn('support', 'attachments', { callback: onFilesPicked }));

  return (
    <PageComponent>
      {hasTicketCreationRights ? (
        <ScrollView contentContainerStyle={styles.container} testID="support-createticket-form">
          <View>
            <BodyBoldText style={styles.titleText}>{I18n.get('support-createticket-reportincident')}</BodyBoldText>
            <SmallText style={styles.informationText}>{I18n.get('support-createticket-mobileonly')}</SmallText>
            <DropDownPicker
              open={isCategoryDropdownOpen}
              value={category}
              items={apps}
              setOpen={setCategoryDropdownOpen}
              setValue={setCategory}
              onOpen={onCategoryOpen}
              style={styles.dropdownContainer}
              dropDownContainerStyle={[styles.dropdownContainer, Platform.OS === 'android' && styles.categoryDropdownListAndroid]}
              textStyle={styles.dropdownText}
              listMode="SCROLLVIEW"
              testID="support-createticket-category"
            />
            {structures.length > 1 ? (
              <DropDownPicker
                open={isStructureDropdownOpen}
                value={structure}
                items={structures}
                setOpen={setStructureDropdownOpen}
                setValue={setStructure}
                onOpen={onStructureOpen}
                style={styles.dropdownContainer}
                containerStyle={styles.structureDropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                listMode="SCROLLVIEW"
                testID="support-createticket-structure"
              />
            ) : null}
            <View style={styles.fields}>
              <SmallBoldText style={styles.inputLabelText}>
                {I18n.get('support-createticket-subject')}
                <NestedBoldText style={styles.mandatoryText}>{MANDATORY_TEXT}</NestedBoldText>
              </SmallBoldText>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                style={styles.subjectInput}
                testID="support-createticket-subject"
              />
              <SmallBoldText style={styles.inputLabelText}>
                {I18n.get('support-createticket-description')}
                <NestedBoldText style={styles.mandatoryText}>{MANDATORY_TEXT}</NestedBoldText>
              </SmallBoldText>
              <TextInput
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
                style={styles.descriptionInput}
                testID="support-createticket-description"
              />
              <View style={styles.attachmentsContainer}>
                <BottomMenu title={I18n.get('support-createticket-addfiles')} actions={fileActions}>
                  <View
                    style={[styles.textIconContainer, filesAdded && styles.textIconContainerSmallerMargin]}
                    testID="support-createticket-addfiles">
                    <SmallActionText style={styles.actionText}>{I18n.get('support-createticket-addfiles')}</SmallActionText>
                    <Svg name="ui-attachment" width={18} height={18} fill={theme.palette.primary.regular} />
                  </View>
                </BottomMenu>
                {attachments.map((attachment, index) => (
                  <Attachment
                    key={`${attachment.filename}-#${index}`}
                    name={attachment.filename}
                    type={attachment.filetype}
                    onRemove={() => removeAttachment(attachment.filepath)}
                  />
                ))}
              </View>
            </View>
          </View>
          <PrimaryButton
            text={I18n.get('support-createticket-sendaction')}
            action={sendTicket}
            disabled={isActionDisabled}
            loading={isSending}
            testID="support-createticket-send"
          />
        </ScrollView>
      ) : (
        <EmptyScreen
          svgImage="empty-support"
          title={I18n.get('support-createticket-emptyscreen-title')}
          testID="support-createticket-empty"
        />
      )}
    </PageComponent>
  );
};

export default defineScreen({
  options: () => ({
    title: I18n.get('support-createticket-title'),
  }),
  screen: withSession<StaticScreenProps<undefined>>(SupportCreateTicketScreen),
});
