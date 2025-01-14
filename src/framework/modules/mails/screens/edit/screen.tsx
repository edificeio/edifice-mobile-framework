import * as React from 'react';
import { View } from 'react-native';

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
  const [content, setContent] = React.useState('');
  const [visibles, setVisibles] = React.useState<MailsVisible[]>();
  const [to, setTo] = React.useState<MailsVisible[]>([]);
  const [cc, setCc] = React.useState<MailsVisible[]>([]);
  const [cci, setCci] = React.useState<MailsVisible[]>([]);
  const [moreRecipientsFields, setMoreRecipientsFields] = React.useState<boolean>(false);

  const loadVisibles = async () => {
    try {
      const dataVisibles = await mailsService.visibles.getAll();
      setVisibles(dataVisibles);
      console.log(dataVisibles.length);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => <NavBarAction icon="ui-send" onPress={() => console.log('send message')} />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!visibles) loadVisibles();
  }, []);

  const toggleMoreRecipientsFields = () => setMoreRecipientsFields(!moreRecipientsFields);

  const renderTopForm = () => {
    return (
      <View style={{ flexGrow: 1 }}>
        <MailsContactField
          type={MailsRecipientsType.TO}
          recipients={to}
          visibles={visibles}
          onToggleMoreRecipientsFields={toggleMoreRecipientsFields}
        />
        {moreRecipientsFields ? (
          <>
            <MailsContactField type={MailsRecipientsType.CC} recipients={cc} visibles={visibles} />
            <MailsContactField type={MailsRecipientsType.CCI} recipients={cci} visibles={visibles} />
          </>
        ) : null}
        <MailsObjectField />
      </View>
    );
  };

  const renderBottomForm = () => (
    <View style={styles.bottomForm}>
      <Attachments isEditing />
    </View>
  );

  return (
    <RichEditorForm
      topForm={renderTopForm}
      initialContentHtml=""
      editorStyle={styles.editor}
      bottomForm={renderBottomForm()}
      onChangeText={value => setContent(value)}
      uploadParams={{
        parent: 'protected',
      }}
    />
  );
}
