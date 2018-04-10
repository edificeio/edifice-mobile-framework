import { preference } from '../../infra/Me';
import { read } from '../../infra/Cache';
import { Conf } from '../../Conf';

export const loadNotificationsPrefs = (dispatch) => async () => {
    const defaultNotifs = await read(`/timeline/notifications-defaults`);
    const timelinePrefs = await preference('timeline');
    const notifsPrefs = Object.keys(timelinePrefs.config).map(key => ({ ...timelinePrefs.config[key], key: key }));
    dispatch({
        type: 'SET_NOTIFICATIONS_PREFS_AUTH',
        notificationsPrefs: [
            ...defaultNotifs.filter(dn => notifsPrefs.find(np => np.key === dn.key) === undefined),
            ...notifsPrefs
        ]
    });
}