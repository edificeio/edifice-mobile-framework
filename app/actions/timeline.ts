import { Conf } from "../Conf";
import { adaptator } from '../infra/HTMLAdaptator';

console.log(Conf);

const availableApps = ['BLOG'];

const dataTypes = {
    'BLOG': async (news) => {
        console.log(news)
        if(!news['sub-resource']){

            return {
                message: adaptator(news.message)
                    .toText(),
                images: [],
                senderName: news.params.username,
                senderId: news.sender,
                resourceName: news.params.blogTitle
            }
        }

        const response = await fetch(`${Conf.platform}/blog/post/${news.resource}/${news['sub-resource']}`);
        const data = await response.json();

        return {
            message: adaptator(data.content)
                .toText(),
            images: adaptator(data.content)
                .toImagesArray(),
            senderName: data.author.username,
            senderId: data.author.userId,
            resourceName: news.params.blogTitle
        };
    }
}

const writeTypesParams = () => {
    let params = '';
    availableApps.forEach(aa => params += '&type=' + aa);
    return params;
}

const fillData = async (results: any[]) => {
    const newResults = [];
    for(let result of results){
        let newResult = await dataTypes[result.type](result);
        newResults.push(newResult);
    }
    console.log(newResults)
    return newResults;
}

export const listTimeline = dispatch => async (page) => {
    console.log(`${Conf.platform}/timeline/lastNotifications?page=${page}`);
    const response = await fetch(`${Conf.platform}/timeline/lastNotifications?page=${page}&${writeTypesParams()}`);
    const news = await response.json();
    const newNews = await fillData(news.results);
    console.log(news)
    dispatch({
        type: 'UPDATE',
        news: newNews
    });
}