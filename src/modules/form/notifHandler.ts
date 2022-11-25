/**
 * Form notif handler
 */
import { computeRelativePath } from '~/framework/util/navigation';
import { NotifHandlerThunkAction, registerNotifHandlers } from '~/framework/util/notifications/routing';
import { getUserSession } from '~/framework/util/session';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';

import moduleConfig from './moduleConfig';
import { DistributionStatus } from './reducer';
import { formService } from './service';

const handleNewFormNotificationAction: NotifHandlerThunkAction =
  (notification, trackCategory, navState) => async (dispatch, getState) => {
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
    if (!form || form.archived) return { managed: 0 };
    const distributions = await formService.distributions.getFromForm(session, formId);
    const distribution = distributions.find(d => d.status === DistributionStatus.TODO);

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
  };

export default () =>
  registerNotifHandlers([
    {
      type: 'FORMULAIRE',
      'event-type': 'NEW_FORM_NOTIFICATION',
      notifHandlerAction: handleNewFormNotificationAction,
    },
  ]);
