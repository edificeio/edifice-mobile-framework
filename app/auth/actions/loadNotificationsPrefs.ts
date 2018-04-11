import { preference } from '../../infra/Me';
import { read } from '../../infra/Cache';
import { Conf } from '../../Conf';

export const loadNotificationsPrefs = (dispatch) => async () => {
    const defaultNotifs = await read(`/timeline/notifications-defaults`);
    const timelinePrefs = await preference('timeline');
    const newNotifs = defaultNotifs.map(notif => ({
            ...notif,
            'push-notif': timelinePrefs.config[notif.key] ? timelinePrefs.config[notif.key]['push-notif'] : false
    }));

    dispatch({
        type: 'SET_NOTIFICATIONS_PREFS_AUTH',
        notificationsPrefs: newNotifs
    });
}