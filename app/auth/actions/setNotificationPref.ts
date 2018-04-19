import { preference, savePreference } from '../../infra/Me';
import { read } from '../../infra/Cache';
import { Conf } from '../../Conf';

export const excludeNotifTypes= [
    "schoolbook.acknowledge", "messagerie.storage", "news.news-update", "news.news-published", "blog.submit-post",
    "blog.publish-comment", "news.news-comment", "news.news-submitted", "news.news-unpublished", "news.news-unsubmitted", "blog.share", "news.thread-shared",
    "schoolbook.modifyresponse"
];

export const setNotificationPref = (dispatch) => async (notif, value, notificationsPrefs) => {
    const newPrefs = notificationsPrefs.reduce((acc, cur, i) => { 
        acc[cur.key] = { 
            ...cur,
            'push-notif': notif.key === cur.key ? value : cur['push-notif'] === true,
            defaultFrequency: (notif.key === cur.key && value) ? 'IMMEDIATE' : cur.defaultFrequency
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