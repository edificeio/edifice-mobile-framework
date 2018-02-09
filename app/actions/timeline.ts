import { Conf } from "../Conf";
import { adaptator } from '../infra/HTMLAdaptator';

console.log(Conf);

const availableApps = ['BLOG'];

const dataTypes = {
    'BLOG': async (news) => {
        let newsData = {
            preview: adaptator(news.message)
                .toOneLineText(),
            message: adaptator(news.message)
                .toText(),
            images: [],
            senderName: news.params.username,
            senderId: news.sender,
            resourceName: news.params.blogTitle
        };

        if(!news['sub-resource']){
            return newsData;
        }

        try{
            const response = await fetch(`${Conf.platform}/blog/post/${news.resource}/${news['sub-resource']}`);
            const data = await response.json();

            return {
                preview: adaptator(data.content)
                    .toText(),
                message: adaptator(data.content)
                    .toHTML(),
                images: adaptator(data.content)
                    .toImagesArray(),
                senderName: data.author.username,
                senderId: data.author.userId,
                resourceName: news.params.blogTitle
            };
        }
        catch(e){
            //fetching blog failed
            return newsData;
        }
    }
}

const excludeTypes = ["BLOG_COMMENT", "BLOG_POST_SUBMIT", "BLOG_POST_PUBLISH"];

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

    return newResults;
}


export const listTimeline = dispatch => async (page) => {
    dispatch({
        type: 'FETCH'
    });
    console.log(`${Conf.platform}/timeline/lastNotifications?page=${page}&${writeTypesParams()}`);
    const response = await fetch(`${Conf.platform}/timeline/lastNotifications?page=${page}&${writeTypesParams()}`);
    
    try{
        const news = await response.json();
        let results = news.results.filter(n => excludeTypes.indexOf(n['event-type']) === -1 && n.params);
        console.log('has '+ results.length + ' results at page ' + page)
        const newNews = await fillData(results);
        console.log('made new news')

        dispatch({
            type: 'APPEND',
            news: newNews
        });
    }
    catch(e){
        console.log(e)
        dispatch({
            type: 'END_REACHED'
        });
    }
}