import { navigate } from "../utils/navHelper";
import { Conf } from "../Conf";
import { Tracking } from "../tracking/TrackingManager";
import { listTimeline } from './actions/list';
import { storedFilters } from './actions/storedFilters';

const openNotif = {
    '/schoolbook': async (data, latestNews) => {
        if(!data.resourceUri || data.resourceUri.indexOf('word') === -1){
            navigate('Timeline');
            return;
        }
        const wordId = data.resourceUri.split('word/')[1];
        const item = latestNews.find(n => n.articleId === wordId && n.application === 'schoolbook');
        Tracking.logEvent('readNews', {
			'application': item.application,
			'articleName': item.title,
			'authorName': item.senderName,
			'published': item.date,
			'articleId': item.id
		});
		
		navigate('NewsContent', { news: item, expend: true });
    },
    '/actualites': data => {

    },
    '/blog': data => {

    }
}

export default dispatch => async notificationData => {
    for(let path in openNotif){
        if(notificationData.resourceUri.startsWith(path)){
            const availableApps = await storedFilters();
            const latestNews = await listTimeline(dispatch)(0, availableApps);
            openNotif[path](notificationData, latestNews);
        }
    }
}