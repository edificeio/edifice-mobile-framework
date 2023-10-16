import { NavigationProp, ParamListBase, UNSTABLE_usePreventRemove, useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

import { I18n } from '~/app/i18n';
import { clearConfirmNavigationEvent, handleRemoveConfirmNavigationEvent } from '~/framework/navigation/helper';

function usePreventBack({ title, text, showAlert }: { title: string; text: string; showAlert: boolean }) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  UNSTABLE_usePreventRemove(showAlert, ({ data }) => {
    Alert.alert(title, text, [
      {
        text: I18n.get('common-quit'),
        onPress: () => {
          handleRemoveConfirmNavigationEvent(data.action, navigation);
        },
        style: 'destructive',
      },
      {
        text: I18n.get('common-continue'),
        style: 'default',
        onPress: () => {
          clearConfirmNavigationEvent();
        },
      },
    ]);
  });
}

export default usePreventBack;
