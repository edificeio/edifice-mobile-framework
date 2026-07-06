import { useConfirmRemove } from '~/app/navigation/use-confirm-remove';

/**
 * @deprecated use useConfirmRemove instead.
 */
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
  useConfirmRemove(showAlert, { onConfirm: actionOnBack, text, title });

  // const navigation = useNavigation<NavigationProp<ParamListBase>>();

  // usePreventRemove(showAlert, ({ data }) => {
  //   Alert.alert(title, text, [
  //     {
  //       onPress: () => {
  //         if (actionOnBack) actionOnBack();
  //         handleRemoveConfirmNavigationEvent(data.action, navigation);
  //       },
  //       style: 'destructive',
  //       text: I18n.get('common-quit'),
  //     },
  //     {
  //       onPress: () => {
  //         clearConfirmNavigationEvent();
  //       },
  //       style: 'default',
  //       text: I18n.get('common-continue'),
  //     },
  //   ]);
  // });
}

export default usePreventBack;
