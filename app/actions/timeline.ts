import I18n from "react-native-i18n";
import { fillUserData } from './auth';
import { Conf } from "../Conf";
import { adaptator } from "../infra/HTMLAdaptator";
import { Me } from "../infra/Me";
import { AsyncStorage } from "react-native";
import { read } from "../infra/Cache";
import { Connection } from "../infra/Connection";

console.log(Conf)

let loadingState = 'idle';
let awaiters = [];
let schoolbooks = [];
const loadSchoolbooks = (): Promise<Array<any>> => {
	return new Promise(async (resolve, reject) => {
		if(loadingState === 'over'){
			resolve(schoolbooks);
			return;
		}
		if(loadingState === 'loading'){
			awaiters.push(() => resolve(schoolbooks));
			return;
		}
		loadingState = 'loading';
		awaiters.push(() => resolve(schoolbooks));
		if(Me.session.type.indexOf('Student') !== -1){
			const response = await read(`/schoolbook/list/0/${Me.session.userId}`);
				const messages = await response.json();
				schoolbooks = [...schoolbooks, ...messages];
		}
		else{
			for(let child of Me.session.children){
				const response = await read(`/schoolbook/list/0/${child.id}`);
				const messages = await response.json();
				schoolbooks = [...schoolbooks, ...messages];
			}
		}
		
		awaiters.forEach(a => a());
		if(Connection.isOnline){
			loadingState = 'over';
		}
		else{
			loadingState = 'idle';
		}
	});
}

const dataTypes = {
	SCHOOLBOOK: async (news, timeline) => {
		let defaultContent = {
			date: news.date.$date,
			id: news._id,
			images: [],
			message: adaptator(news.message).toText(),
			resourceName: I18n.t("schoolbook-appTitle"),
			htmlContent: adaptator(news.message).adapt().toHTML(),
			senderId: news.sender,
			senderName: news.params.username,
			title: news.params.wordTitle
		};
		if(!news.params.resourceUri || news.params.resourceUri.indexOf('word') === -1){
			return defaultContent;
		}
		try{
			const schoolbooks = await loadSchoolbooks();
			const schoolbookId = news.params.resourceUri.split('word/')[1];
			const schoolbook = schoolbooks.find(s => s.id === parseInt(schoolbookId));

			if(timeline.find(e => e.resourceId === schoolbookId)){
				return null;
			}

			if(schoolbook){
				return {
					date: news.date.$date,
					id: news._id,
					images: adaptator(schoolbook.text).toImagesArray(),
					message: adaptator(schoolbook.text).toText(),
					resourceName: I18n.t("schoolbook-appTitle"),
					htmlContent: adaptator(schoolbook.text).adapt().toHTML(),
					senderId: news.sender,
					senderName: news.params.username,
					title: schoolbook.title,
					resourceId: schoolbookId
				}
			}
			return defaultContent;
		}
		catch(e){
			return defaultContent;
		}
	},
	NEWS: async (news, timeline) => {
		const newsData = {
			date: news.date.$date,
			id: news._id,
			images: [],
			message: adaptator(news.message).toText(),
			resourceName: news.params.resourceName,
			htmlContent: adaptator(news.message).adapt().toHTML(),
			senderId: news.sender,
			senderName: news.params.username,
			title: news.params.resourceName
		}
		if (news.params.resourceUri.indexOf('/info') === -1) {
			return newsData
		}

		const split = news.params.resourceUri.split('/');
		const infoId = split[split.length -1];
		const threadSplit = news.params.resourceUri.split('thread/');
		const threadId = parseInt(threadSplit[threadSplit.length - 1]);

		if(timeline.find(e => e.resourceId === infoId)){
			return null;
		}

		try {

			const data = await read(`/actualites/thread/${threadId}/info/${infoId}`, false);

			return {
				date: news.date.$date,
				id: data._id,
				images: adaptator(data.content).toImagesArray(),
				message: adaptator(data.content).toText(),
				resourceName: data.thread_title,
				senderId: news.sender,
				senderName: news.params.username,
				title: data.title,
				resourceId: infoId
			}
		} catch (e) {
			//resource has been deleted
			return newsData
		}
	},
	BLOG: async (news, timeline) => {
		const newsData = {
			date: news.date.$date,
			id: news._id,
			images: [],
			message: adaptator(news.message).toText(),
			resourceName: news.params.blogTitle,
			senderId: news.sender,
			senderName: news.params.username,
			title: news.params.blogTitle
		}

		if (!news["sub-resource"]) {
			return newsData;
		}

		if(timeline.find(e => e.resourceId === news['sub-resource'])){
			return null;
		}

		try {
			const data = await read(`/blog/post/${news.resource}/${news["sub-resource"]}`, false);

			let message = adaptator(data.content).toText()

			return {
				date: data.modified.$date,
				id: data._id,
				images: adaptator(data.content).toImagesArray(),
				message,
				resourceName: news.params.blogTitle,
				resourceId: news['sub-resource'],
				senderId: data.author.userId,
				senderName: data.author.username,
				title: data.title
			}
		} catch (e) {
			//fetching blog failed
			return newsData
		}
	},
}

const excludeTypes = ["BLOG_COMMENT", "BLOG_POST_SUBMIT", "BLOG_POST_PUBLISH", "NEWS-COMMENT"]

const writeTypesParams = (availableApps) => {
	let params = "";
	for(let app in availableApps){
		if(availableApps[app]){
			params += "&type=" + app;
		}
	}
	return params;
}

const fillData = async (availableApps, results: any[]) => {
	const newResults = []
	for (let result of results) {
		if(dataTypes[result.type] && availableApps[result.type]){
			let newResult = await dataTypes[result.type](result, newResults);
			if(newResult){
				newResult.application = result.type.toLowerCase();
				newResults.push(newResult);
			}
		}
	}

	return newResults
}

const storedFilters = async () => {
	const apps = await AsyncStorage.getItem('timeline-filters');
	if(!apps){
		return { "BLOG": true, "NEWS": true, "SCHOOLBOOK": true };
	}
	return JSON.parse(apps);
}
const storeFilters = async (availableApps) => await AsyncStorage.setItem('timeline-filters', JSON.stringify(availableApps));

export const pickFilters = dispatch => (selectedApps) => {
	dispatch({
		type: "PICK_FILTER_TIMELINE",
		selectedApps: selectedApps
	});
}

export const setFilters = dispatch => (availableApps) => {
	dispatch({
		type: "FILTER_TIMELINE",
		availableApps: availableApps
	});

	storeFilters(availableApps);
	listTimeline(dispatch)(0, availableApps);
}

export const clearTimeline = dispatch => () => {
	dispatch({
		type: "CLEAR_TIMELINE"
	});
}

export const fetchTimeline = dispatch => async (availableApps) => {
	dispatch({
		type: "FETCH_TIMELINE",
	});

	const news = await read(`/timeline/lastNotifications?page=0&${writeTypesParams(availableApps)}`)

	try {
		let results = news.results.filter(n => excludeTypes.indexOf(n["event-type"]) === -1 && n.params);
		const newNews = await fillData(availableApps, results)

		if(newNews.length > 0){
			dispatch({
				type: "FETCH_NEW_TIMELINE",
				news: newNews
			});
		}
	} catch (e) {
		console.log(e);
	}
}

export const listTimeline = dispatch => async (page, availableApps) => {
	dispatch({
		type: "FETCH_TIMELINE",
	})
	await fillUserData();
	
	if(!availableApps){
		availableApps = await storedFilters();
		dispatch({
			type: "FILTER_TIMELINE",
			availableApps: availableApps
		});

		dispatch({
			type: "PICK_FILTER_TIMELINE",
			selectedApps: availableApps
		});
	}
	const news = await read(`/timeline/lastNotifications?page=${page}&${writeTypesParams(availableApps)}`)

	try {
		let results = news.results.filter(n => excludeTypes.indexOf(n["event-type"]) === -1 && n.params);
		const newNews = await fillData(availableApps, results)

		if(newNews.length > 0){
			dispatch({
				type: "APPEND_TIMELINE",
				news: newNews
			});
		}
		else{
			dispatch({
				type: "END_REACHED_TIMELINE",
			});
		}
	} catch (e) {
		console.log(e)
		dispatch({
			type: "END_REACHED_TIMELINE",
		})
	}
}
