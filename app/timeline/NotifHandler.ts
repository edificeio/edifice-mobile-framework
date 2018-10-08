import { navigate } from "../navigation/helpers/navHelper";
import { Conf } from "../Conf";
import { Tracking } from "../tracking/TrackingManager";
import { listTimeline } from './actions/list';
import { storedFilters } from './actions/storedFilters';

const openNotif = {
    '/schoolbook': (data, latestNews) => {
        if(!data.resourceUri || data.resourceUri.indexOf('word') === -1){
            navigate('notifications');
            return;
        }
        const wordId = data.resourceUri.split('word/')[1];
        return latestNews.find(n => n.resourceId === wordId && n.application === 'schoolbook');
    },
    '/actualites': (data, latestNews) => {
        if (data.resourceUri.indexOf('/info') === -1) {
			navigate('notifications');
            return;
        }
        
        const split = data.resourceUri.split('/');
		const infoId = split[split.length -1];
        return latestNews.find(n => n.resourceId == infoId && n.application === 'news');
    },
    '/blog': (data, latestNews) => {
        if (!data.postUri) {
			return;
		}

        const split = data.postUri.split('/');
        const postId = split[split.length -1];
        return latestNews.find(n => n.resourceId === postId && n.application === 'blog');
    }
}

export default dispatch => async notificationData => {
    for(let path in openNotif){
        if(notificationData.resourceUri.startsWith(path)){
            const availableApps = await storedFilters();
            const latestNews = await listTimeline(dispatch)(0, availableApps);
            const item = openNotif[path](notificationData, latestNews);
            if(item){
                Tracking.logEvent('readNews', {
                    'application': item.application,
                    'articleName': item.title,
                    'authorName': item.senderName,
                    'published': item.date,
                    'articleId': item.id
                });
                navigate('newsContent', { news: item, expend: true });
            }
            else{
                navigate('notifications');
            }
        }
    }
}