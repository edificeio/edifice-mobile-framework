import { preference, savePreference } from '../../infra/Me';
import { read } from '../../infra/Cache';
import { Conf } from '../../Conf';

export const setNotificationPref = (dispatch) => async (notif, value, notificationsPrefs) => {
    const newPrefs = notificationsPrefs.reduce((acc, cur, i) => { 
        acc[cur.key] = { 
            ...cur,
            'push-notif': notif.key === cur.key ? value : cur['push-notif'] === true 
        };
        return acc;
    }, {});

    dispatch({
        type: 'SET_NOTIFICATIONS_PREFS_AUTH',
        notificationsPrefs: Object.keys(newPrefs).map(p => ({ ...newPrefs[p], key: p }))
    });

    savePreference('timeline', {
        config: newPrefs
    });
}