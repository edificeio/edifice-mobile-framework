import React, { useCallback, useEffect, useMemo } from 'react';
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
  const [value, setValue] = React.useState<string>(props.initialInputValue ?? '');
  const [error, setError] = React.useState<boolean>(false);

  const disabledAction = useMemo(
    () => value.trim().length === 0 || error || props.initialInputValue === value || props.disabledAction,
    [value, error, props.initialInputValue, props.disabledAction],
  );

  const onChangeText = useCallback(
    (text: string) => {
      setValue(text);
      if (error) setError(false);
    },
    [error],
  );

  useEffect(() => {
    setError(props.onError ?? false);
  }, [props.onError]);

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
          iconRightDisabled={disabledAction}
          onPressRight={() => props.onSend(value.trim())}
        />
        <InputContainer
          label={{ icon: 'ui-folder', indicator: LabelIndicator.REQUIRED, text: props.inputLabel }}
          input={
            <TextInput
              placeholder={props.inputPlaceholder}
              onChangeText={onChangeText}
              value={value}
              showError={error}
              annotation={error ? I18n.get('mails-list-newfolderduplicate') : undefined}
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
