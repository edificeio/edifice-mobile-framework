import { preference } from '../../infra/Me';
import { read } from '../../infra/Cache';
import { Conf } from '../../Conf';

export const loadNotificationsPrefs = (dispatch) => async () => {
    const defaultNotifs = await read(`/timeline/notifications-defaults`);
    const timelinePrefs = await preference('timeline');
    const newNotifs = defaultNotifs.map(notif => ({
            ...notif,
            defaultFrequency: (timelinePrefs.config && timelinePrefs.config[notif.key]) ? timelinePrefs.config[notif.key].defaultFrequency : notif.defaultFrequency,
            'push-notif': (
                timelinePrefs.config && timelinePrefs.config[notif.key] && timelinePrefs.config[notif.key].defaultFrequency === 'IMMEDIATE'
            ) ? timelinePrefs.config[notif.key]['push-notif'] : false
    }));

    dispatch({
        type: 'SET_NOTIFICATIONS_PREFS_AUTH',
        notificationsPrefs: newNotifs
    });
}