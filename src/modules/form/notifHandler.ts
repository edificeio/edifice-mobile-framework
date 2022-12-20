/**
 * Form notif handler
 */
import I18n from 'i18n-js';
import { Alert } from 'react-native';

import { openUrl } from '~/framework/util/linking';
import { computeRelativePath } from '~/framework/util/navigation';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';
import { getUserSession } from '~/framework/util/session';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';

import moduleConfig from './moduleConfig';
import { DistributionStatus } from './reducer';
import { formService } from './service';

const handleNewFormNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navState) => async (dispatch, getState) => {
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
      const session = getUserSession();
      const form = await formService.form.get(session, formId);
      if (!form || form.archived) {
        Alert.alert(I18n.t('form.missingFormAlert'));
        return { managed: 0 };
      }
      const distributions = await formService.distributions.getFromForm(session, formId);
      const distribution =
        distributions.length === 1 ? distributions[0] : distributions.find(d => d.status === DistributionStatus.TO_DO);

      if (distribution) {
        mainNavNavigate(computeRelativePath(`${moduleConfig.routeName}/distribution`, navState), {
          id: distribution.id,
          status: distribution.status,
          formId: form.id,
          title: form.title,
          editable: form.editable,
        });
      } else {
        mainNavNavigate(computeRelativePath(moduleConfig.routeName, navState));
      }
      return {
        managed: 1,
        trackInfo: { action: 'Form', name: `${notification.type}.${notification['event-type']}` },
      };
    } catch (e) {
      return { managed: 0 };
    }
  };

const handleFormResponseNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navState) => async (dispatch, getState) => {
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
