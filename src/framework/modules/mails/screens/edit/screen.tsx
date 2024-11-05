import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { MailsEditScreenPrivateProps } from './types';

import { RichEditorForm } from '~/framework/components/inputs/rich-text';
import { NavBarAction } from '~/framework/components/navigation';
import { SmallBoldText } from '~/framework/components/text';
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

  React.useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => <NavBarAction icon="ui-send" onPress={() => console.log('send message')} />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RichEditorForm topForm={<SmallBoldText>test</SmallBoldText>} initialContentHtml="" onChangeText={value => setContent(value)} />
  );
}
