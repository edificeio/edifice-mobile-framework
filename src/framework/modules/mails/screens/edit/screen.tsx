import * as React from 'react';
import { Alert, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';
import type { MailsEditScreenPrivateProps } from './types';

import Attachments from '~/framework/components/attachments';
import { RichEditorForm } from '~/framework/components/inputs/rich-text';
import { NavBarAction } from '~/framework/components/navigation';
import { MailsContactField, MailsObjectField } from '~/framework/modules/mails/components/fields';
import { MailsRecipientsType, MailsVisible } from '~/framework/modules/mails/model';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { mailsService } from '~/framework/modules/mails/service';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<MailsNavigationParams, typeof mailsRouteNames.edit>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: '',
  }),
});

export default function MailsEditScreen(props: MailsEditScreenPrivateProps) {
  const [content, setContent] = React.useState(props.route.params.body ?? '');
  const [visibles, setVisibles] = React.useState<MailsVisible[]>();
  const [to, setTo] = React.useState<MailsVisible[]>(props.route.params.to ?? []);
  const [cc, setCc] = React.useState<MailsVisible[]>(props.route.params.cc ?? []);
  const [cci, setCci] = React.useState<MailsVisible[]>(props.route.params.cci ?? []);
  const [moreRecipientsFields, setMoreRecipientsFields] = React.useState<boolean>(false);

  const loadVisibles = async () => {
    try {
      const dataVisibles = await mailsService.visibles.getAll();
      setVisibles(dataVisibles);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMoreRecipientsFields = () => setMoreRecipientsFields(!moreRecipientsFields);

  const updateVisiblesWithoutSelectedRecipients = (newVisibles: MailsVisible[]) => {
    setVisibles(newVisibles);
  };

  const onChangeRecipient = (selectedRecipients, type) => {
    const stateSetters: Record<MailsRecipientsType, React.Dispatch<React.SetStateAction<MailsVisible[]>>> = {
      to: setTo,
      cc: setCc,
      cci: setCci,
    };

    stateSetters[type](selectedRecipients);
  };

  React.useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => <NavBarAction icon="ui-send" onPress={() => Alert.alert('send message')} />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!visibles) loadVisibles();
  }, []);

  const renderTopForm = React.useCallback(() => {
    if (!visibles) return;
    return (
      <View style={{ flexGrow: 1 }}>
        <MailsContactField
          type={MailsRecipientsType.TO}
          recipients={to}
          visibles={visibles}
          onChangeRecipient={onChangeRecipient}
          onBlur={updateVisiblesWithoutSelectedRecipients}
          forceOpenMoreFields={cc.length > 0 || cci.length > 0}
          onToggleMoreRecipientsFields={toggleMoreRecipientsFields}
        />
        {moreRecipientsFields ? (
          <>
            <MailsContactField
              type={MailsRecipientsType.CC}
              recipients={cc}
              visibles={visibles}
              onChangeRecipient={onChangeRecipient}
              onBlur={updateVisiblesWithoutSelectedRecipients}
            />
            <MailsContactField
              type={MailsRecipientsType.CCI}
              recipients={cci}
              visibles={visibles}
              onChangeRecipient={onChangeRecipient}
              onBlur={updateVisiblesWithoutSelectedRecipients}
            />
          </>
        ) : null}
        <MailsObjectField subject={props.route.params.subject} type={props.route.params.type} />
      </View>
    );
  }, [
    visibles,
    to,
    cc,
    cci,
    props.route.params,
    onChangeRecipient,
    updateVisiblesWithoutSelectedRecipients,
    toggleMoreRecipientsFields,
  ]);

  const renderBottomForm = React.useCallback(
    () => (
      <View style={styles.bottomForm}>
        <Attachments isEditing />
      </View>
    ),
    [],
  );

  return (
    <RichEditorForm
      topForm={renderTopForm}
      initialContentHtml={content}
      editorStyle={styles.editor}
      bottomForm={renderBottomForm()}
      onChangeText={value => setContent(value)}
      uploadParams={{
        parent: 'protected',
      }}
    />
  );
}
