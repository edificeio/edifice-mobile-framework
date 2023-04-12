import { StackActions } from '@react-navigation/native';
import I18n from 'i18n-js';
import { Alert } from 'react-native';

import { assertSession } from '~/framework/modules/auth/reducer';
import timlineModuleConfig from '~/framework/modules/timelinev2/moduleConfig';
import { navigate, navigationRef } from '~/framework/navigation/helper';
import { computeTabRouteName } from '~/framework/navigation/tabModules';
import { openUrl } from '~/framework/util/linking';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';

import { DistributionStatus } from './model';
import { formRouteNames } from './navigation';
import { formService } from './service';

const handleNewFormNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  try {
    let formUri = notification.backupData.params.formUri;
    if (!formUri) return { managed: 0 };
    let index = formUri.indexOf('form/');
    if (index === -1) return { managed: 0 };
    formUri = formUri.substring(index + 5);
    index = formUri.indexOf('/');
    if (index !== -1) {
      formUri = formUri.substring(0, index);
    }
    const formId = Number(formUri);
    const session = assertSession();
    const form = await formService.form.get(session, formId);
    const hasResponderRight = await formService.form.hasResponderRight(session, formId);
    if (!form || form.archived || !hasResponderRight) {
      Alert.alert(I18n.t('form.missingFormAlert'));
      return { managed: 0 };
    }
    const distributions = await formService.distributions.getFromForm(session, formId);
    const distribution =
      distributions.length === 1 ? distributions[0] : distributions.find(d => d.status === DistributionStatus.TO_DO);

    if (distribution) {
      navigationRef.dispatch(StackActions.popToTop());
      navigate(computeTabRouteName(timlineModuleConfig.routeName), {
        initial: false,
        screen: formRouteNames.distribution,
        params: {
          id: distribution.id,
          status: distribution.status,
          formId: form.id,
          title: form.title,
          editable: form.editable,
        },
      });
    } else {
      navigationRef.dispatch(StackActions.popToTop());
      navigate(computeTabRouteName(timlineModuleConfig.routeName), {
        initial: false,
        screen: formRouteNames.home,
        params: {},
      });
    }
    return {
      managed: 1,
      trackInfo: { action: 'Form', name: `${notification.type}.${notification['event-type']}` },
    };
  } catch {
    return { managed: 0 };
  }
};

const handleFormResponseNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  const uri = notification.backupData.params.formResultsUri;

  if (!uri) return { managed: 0 };
  openUrl(uri);
  return {
    managed: 1,
    trackInfo: { action: 'Form', name: `${notification.type}.${notification['event-type']}` },
  };
};

export default () =>
  registerNotifHandlers([
    {
      type: 'FORMULAIRE',
      'event-type': 'NEW_FORM_NOTIFICATION',
      notifHandlerAction: handleNewFormNotificationAction,
    },
    {
      type: 'FORMULAIRE',
      'event-type': 'RESPONSE_NOTIFICATION',
      notifHandlerAction: handleFormResponseNotificationAction,
    },
  ]);
