import { Alert } from 'react-native';

import { NavigationProp, ParamListBase, UNSTABLE_usePreventRemove, useNavigation } from '@react-navigation/native';

import { I18n } from '~/app/i18n';
import { clearConfirmNavigationEvent, handleRemoveConfirmNavigationEvent } from '~/framework/navigation/helper';

function usePreventBack({
  actionOnBack,
  showAlert,
  text,
  title,
}: {
  title: string;
  text: string;
  showAlert: boolean;
  actionOnBack?: () => void;
}) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  UNSTABLE_usePreventRemove(showAlert, ({ data }) => {
    Alert.alert(title, text, [
      {
        onPress: () => {
          if (actionOnBack) actionOnBack();
          handleRemoveConfirmNavigationEvent(data.action, navigation);
        },
        style: 'destructive',
        text: I18n.get('common-quit'),
      },
      {
        onPress: () => {
          clearConfirmNavigationEvent();
        },
        style: 'default',
        text: I18n.get('common-continue'),
      },
    ]);
  });
}

export default usePreventBack;
