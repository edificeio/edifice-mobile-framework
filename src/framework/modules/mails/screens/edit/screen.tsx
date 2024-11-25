import * as React from 'react';
import { View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';
import type { MailsEditScreenPrivateProps } from './types';

import Attachments from '~/framework/components/attachments';
import { RichEditorForm } from '~/framework/components/inputs/rich-text';
import { NavBarAction } from '~/framework/components/navigation';
import { AccountType } from '~/framework/modules/auth/model';
import { MailsContactField, MailsObjectField } from '~/framework/modules/mails/components/fields';
import { MailsRecipientsType } from '~/framework/modules/mails/model';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
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
  const [moreRecipientsFields, setMoreRecipientsFields] = React.useState<boolean>(false);

  React.useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => <NavBarAction icon="ui-send" onPress={() => console.log('send message')} />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMoreRecipientsFields = () => setMoreRecipientsFields(!moreRecipientsFields);

  const renderTopForm = () => {
    return (
      <>
        <MailsContactField
          type={MailsRecipientsType.TO}
          recipients={[
            { displayName: 'Léa DE AMORIM', id: 'test-1', type: AccountType.Student },
            { displayName: 'Junior BERNARD', id: 'test-2', type: AccountType.Teacher },
            { displayName: 'Marius ESTAQUE', id: 'test-3', type: AccountType.Relative },
          ]}
          onDelete={() => console.log('onDelete recipient')}
          isOpenMoreRecipientsFields={moreRecipientsFields}
          onToggleMoreRecipientsFields={toggleMoreRecipientsFields}
        />
        {moreRecipientsFields ? (
          <>
            <MailsContactField
              type={MailsRecipientsType.CC}
              recipients={[]}
              onDelete={() => console.log('onDelete recipient cc')}
            />
            <MailsContactField
              type={MailsRecipientsType.CCI}
              recipients={[]}
              onDelete={() => console.log('onDelete recipient cci')}
            />
          </>
        ) : null}
        <MailsObjectField />
      </>
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
    />
  );
}
