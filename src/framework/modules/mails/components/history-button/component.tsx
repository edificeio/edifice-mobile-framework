import * as React from 'react';
import { View } from 'react-native';

import styles from './styles';
import { MailsHistoryButtonProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text';
import Separator from '~/framework/components/separator';

export const MailsHistoryButton = (props: MailsHistoryButtonProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const { content } = props;

  const onPress = () => {
    setIsOpen(!isOpen);
    if (props.onPress) props.onPress();
  };

  return (
    <View style={styles.container}>
      <DefaultButton
        text={isOpen ? I18n.get('mails-historyhide') : I18n.get('mails-historysee')}
        iconRight={isOpen ? 'ui-rafterUp' : 'ui-rafterDown'}
        contentColor={theme.palette.grey.black}
        style={styles.button}
        action={onPress}
      />
      {isOpen ? <RichEditorViewer content={content} /> : null}
      <Separator />
    </View>
  );
};
