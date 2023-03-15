import { CommonActions } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, TextInput, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import ActionButton from '~/framework/components/buttons/action';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { cameraAction, documentAction, galleryAction } from '~/framework/components/menus/actions';
import BottomMenu from '~/framework/components/menus/bottom';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import { BodyBoldText, NestedBoldText, SmallActionText, SmallBoldText, SmallText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import { postSupportTicketAction, uploadSupportTicketAttachmentsAction } from '~/framework/modules/support/actions';
import { SupportNavigationParams, supportRouteNames } from '~/framework/modules/support/navigation';
import { getSupportWorkflowInformation } from '~/framework/modules/support/rights';
import { Attachment } from '~/framework/modules/zimbra/components/Attachment';
import { navBarOptions } from '~/framework/navigation/navBar';
import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';
import { tryAction } from '~/framework/util/redux/actions';

import styles from './styles';
import { ISupportCreateTicketScreenEventProps, ISupportCreateTicketScreenProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<SupportNavigationParams, typeof supportRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({ navigation, route }),
  title: I18n.t('support.tabName'),
});

const SupportCreateTicketScreen = (props: ISupportCreateTicketScreenProps) => {
  const hasTicketCreationRights = props.session && getSupportWorkflowInformation(props.session)?.createTicket;
  const [isCategoryDropdownOpen, setCategoryDropdownOpen] = React.useState(false);
  const [isStructureDropdownOpen, setStructureDropdownOpen] = React.useState(false);
  const [category, setCategory] = React.useState(props.apps[0]?.value);
  const [structure, setStructure] = React.useState(props.structures[0]?.value);
  const [subject, setSubject] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [attachments, setAttachments] = React.useState<LocalFile[]>([]);
  const [isSending, setSending] = React.useState(false);

  const addAttachment = file => {
    setAttachments(previousAttachments => [...previousAttachments, new LocalFile(file, { _needIOSReleaseSecureAccess: false })]);
  };

  const removeAttachment = (filepath: string) => {
    setAttachments(attachments.filter(a => a.filepath !== filepath));
  };

  const sendTicket = async () => {
    try {
      let uploadedAttachments: undefined | SyncedFileWithId[];
      setSending(true);
      if (attachments.length) {
        uploadedAttachments = await props.uploadAttachments(attachments);
      }
      const ticketId = await props.postTicket(category, structure, subject, description, uploadedAttachments);
      Toast.showSuccess(I18n.t('support.supportCreateTicketScreen.successCreationId', { id: ticketId }), {
        ...UI_ANIMATIONS.toast,
      });
      props.navigation.dispatch(CommonActions.goBack());
    } catch {
      setSending(false);
      Toast.show(I18n.t('support.supportCreateTicketScreen.failure'), { ...UI_ANIMATIONS.toast });
    }
  };

  // const handleGoBack = () => {
  //   const { navigation } = props;
  //   if (!subject && !description) return true;
  //   Alert.alert(I18n.t('common.confirmationLeaveAlert.title'), I18n.t('common.confirmationLeaveAlert.message'), [
  //     {
  //       text: I18n.t('common.cancel'),
  //       style: 'cancel',
  //     },
  //     {
  //       text: I18n.t('common.quit'),
  //       style: 'destructive',
  //       onPress: () => navigation.dispatch(CommonActions.goBack()),
  //     },
  //   ]);
  // };

  const renderPage = () => {
    const { apps, structures } = props;
    const mandatoryText = ' *';
    const filesAdded = attachments.length > 0;
    const isActionDisabled = subject === '' || subject.length > 255 || description === '';

    return hasTicketCreationRights ? (
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <BodyBoldText style={styles.titleText}>{I18n.t('support.supportCreateTicketScreen.reportIncident')}</BodyBoldText>
          <SmallText style={styles.informationText}>{I18n.t('support.supportCreateTicketScreen.mobileOnly')}</SmallText>
          <DropDownPicker
            open={isCategoryDropdownOpen}
            value={category}
            items={apps}
            setOpen={setCategoryDropdownOpen}
            setValue={setCategory}
            style={styles.dropdownContainer}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
            zIndex={2000}
            zIndexInverse={1000}
          />
          {structures.length > 1 ? (
            <DropDownPicker
              open={isStructureDropdownOpen}
              value={structure}
              items={structures}
              setOpen={setStructureDropdownOpen}
              setValue={setStructure}
              style={styles.dropdownContainer}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              zIndex={1000}
              zIndexInverse={2000}
            />
          ) : null}
          <SmallBoldText style={styles.inputLabelText}>
            {I18n.t('support.supportCreateTicketScreen.subject')}
            <NestedBoldText style={styles.mandatoryText}>{mandatoryText}</NestedBoldText>
          </SmallBoldText>
          <TextInput value={subject} onChangeText={text => setSubject(text)} style={styles.subjectInput} />
          <SmallBoldText style={styles.inputLabelText}>
            {I18n.t('support.supportCreateTicketScreen.description')}
            <NestedBoldText style={styles.mandatoryText}>{mandatoryText}</NestedBoldText>
          </SmallBoldText>
          <TextInput
            value={description}
            onChangeText={text => setDescription(text)}
            multiline
            textAlignVertical="top"
            style={styles.descriptionInput}
          />
          <View style={styles.attachmentsContainer}>
            <BottomMenu
              title={I18n.t('common.addFiles')}
              actions={[
                cameraAction({ callback: addAttachment }),
                galleryAction({ callback: addAttachment, multiple: true }),
                documentAction({ callback: addAttachment }),
              ]}>
              <View style={[styles.textIconContainer, filesAdded && styles.textIconContainerSmallerMargin]}>
                <SmallActionText style={styles.actionText}>{I18n.t('common.addFiles')}</SmallActionText>
                <Picture type="NamedSvg" name="ui-attachment" width={18} height={18} fill={theme.palette.primary.regular} />
              </View>
            </BottomMenu>
            {attachments.map(attachment => (
              <Attachment
                key={attachment.filename}
                name={attachment.filename}
                type={attachment.filetype}
                onRemove={() => removeAttachment(attachment.filepath)}
              />
            ))}
          </View>
        </View>
        <ActionButton
          text={I18n.t('common.send')}
          action={sendTicket}
          disabled={isActionDisabled}
          loading={isSending}
          style={styles.actionContainer}
        />
      </ScrollView>
    ) : (
      <EmptyScreen svgImage="empty-support" title={I18n.t('support.supportCreateTicketScreen.emptyScreen.title')} />
    );
  };

  const PageComponent = Platform.select<typeof KeyboardPageView | typeof PageView>({ ios: KeyboardPageView, android: PageView })!;

  return <PageComponent>{renderPage()}</PageComponent>;
};

export default connect(
  (gs: IGlobalState) => {
    const apps = [] as any[];
    //console.debug(gs);
    console.debug(gs.auth.session.user.structures);
    for (const app of gs.auth.session.apps) {
      if (app.address && app.name && app.address.length > 0 && app.name.length > 0) {
        const translation = I18n.t('modules-names.' + app.displayName.toLowerCase());
        if (translation.substring(0, 9) !== '[missing ') {
          apps.push({ ...app, name: translation });
        } else if (/^[A-Z]/.test(app.displayName)) {
          apps.push({ ...app, name: app.displayName });
        }
      }
    }
    apps.push({
      address: 'modules-names.other',
      name: I18n.t('modules-names.other'),
    });
    apps.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    return {
      apps: apps.map(app => {
        return {
          label: app.name,
          value: app.address,
        };
      }),
      structures: gs.auth.session.user.structures.map(school => {
        return {
          label: school.name,
          value: school.id,
        };
      }),
      session: getSession(gs),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        postTicket: tryAction(postSupportTicketAction, undefined, true) as ISupportCreateTicketScreenEventProps['postTicket'],
        uploadAttachments: tryAction(
          uploadSupportTicketAttachmentsAction,
          undefined,
          true,
        ) as unknown as ISupportCreateTicketScreenEventProps['uploadAttachments'],
      },
      dispatch,
    ),
)(SupportCreateTicketScreen);
