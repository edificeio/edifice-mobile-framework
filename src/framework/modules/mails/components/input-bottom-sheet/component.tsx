import React from 'react';
import { View } from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';

import styles from './styles';
import { MailsInputBottomSheetProps } from './types';

import { I18n } from '~/app/i18n';
import InputContainer from '~/framework/components/inputs/container';
import { LabelIndicator } from '~/framework/components/inputs/container/label';
import TextInput from '~/framework/components/inputs/text';
import HeaderBottomSheetModal from '~/framework/components/modals/bottom-sheet/header';

const MailsInputBottomSheet = (props: React.PropsWithChildren<MailsInputBottomSheetProps>) => {
  return (
    <ScrollView
      keyboardDismissMode="none"
      keyboardShouldPersistTaps="always"
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      bounces={false}>
      <View style={styles.scrollViewBottomSheet}>
        <HeaderBottomSheetModal
          title={props.title}
          iconRight="ui-check"
          iconRightDisabled={props.disabledAction}
          onPressRight={props.action}
        />
        <InputContainer
          label={{ icon: 'ui-folder', indicator: LabelIndicator.REQUIRED, text: props.inputLabel }}
          input={
            <TextInput
              placeholder={props.inputPlaceholder}
              onChangeText={props.setInputValue}
              value={props.inputValue}
              showError={props.onError}
              annotation={props.onError ? I18n.get('mails-list-newfolderduplicate') : undefined}
              maxLength={50}
            />
          }
        />
        {props.children}
      </View>
    </ScrollView>
  );
};

export default MailsInputBottomSheet;
