import { Conf } from "../Conf"
import { adaptator } from "../infra/HTMLAdaptator"

console.log(Conf)

const availableApps = ["BLOG", "NEWS"]

const dataTypes = {
	NEWS: async news => {
		let newsData = {
			date: news.date.$date,
			id: news._id,
			images: [],
			message: adaptator(news.message).toText(),
			preview: adaptator(news.message).toOneLineText(),
			resourceName: news.params.resourceName,
			senderId: news.sender,
			senderName: news.params.username,
		}
		if (news.params.resourceUri.indexOf('/info') === -1) {
			return newsData
		}

		const split = news.params.resourceUri.split('/');
		const infoId = split[split.length -1];
		const threadSplit = news.params.resourceUri.split('thread/');
		const threadId = parseInt(threadSplit[threadSplit.length - 1]);
		try {
			console.log(`${Conf.platform}/actualites/thread/${threadId}/info/${infoId}`)
			const response = await fetch(`${Conf.platform}/actualites/thread/${threadId}/info/${infoId}`)
			const data = await response.json()

			let previewText = adaptator(data.content).toText()
			if (previewText.length > 175) {
				previewText = previewText.substring(0, 172) + "..."
			}

			return {
				date: data.publication_date,
				id: data._id,
				images: adaptator(data.content).toImagesArray(),
				message: adaptator(data.content).toText(),
				preview: previewText,
				resourceName: news.params.resourceName,
				senderId: data.userId,
				senderName: news.params.username,
			}
		} catch (e) {
			console.log(e);
			return newsData
		}
	},
	BLOG: async news => {
		let newsData = {
			date: news.date.$date,
			id: news._id,
			images: [],
			message: adaptator(news.message).toText(),
			preview: adaptator(news.message).toOneLineText(),
			resourceName: news.params.blogTitle,
			senderId: news.sender,
			senderName: news.params.username,
		}

		if (!news["sub-resource"]) {
			return newsData
		}

		try {
			const response = await fetch(`${Conf.platform}/blog/post/${news.resource}/${news["sub-resource"]}`)
			const data = await response.json()

			let previewText = adaptator(data.content).toText()
			if (previewText.length > 175) {
				previewText = previewText.substring(0, 172) + "..."
			}

			return {
				date: data.modified.$date,
				id: data._id,
				images: adaptator(data.content).toImagesArray(),
				message: adaptator(data.content).toText(),
				preview: previewText,
				resourceName: news.params.blogTitle,
				senderId: data.author.userId,
				senderName: data.author.username,
			}
		} catch (e) {
			//fetching blog failed
			return newsData
		}
	},
}

const excludeTypes = ["BLOG_COMMENT", "BLOG_POST_SUBMIT", "BLOG_POST_PUBLISH", "NEWS-COMMENT"]

const writeTypesParams = () => {
	let params = ""
	availableApps.forEach(aa => (params += "&type=" + aa))
	return params
}

const fillData = async (results: any[]) => {
	const newResults = []
	for (let result of results) {
		let newResult = await dataTypes[result.type](result)
		newResults.push(newResult)
	}

	return newResults
}

export const listTimeline = dispatch => async page => {
	dispatch({
		type: "FETCH",
	})
	console.log(`${Conf.platform}/timeline/lastNotifications?page=${page}&${writeTypesParams()}`)
	const response = await fetch(`${Conf.platform}/timeline/lastNotifications?page=${page}&${writeTypesParams()}`)

	try {
		const news = await response.json()
		let results = news.results.filter(n => excludeTypes.indexOf(n["event-type"]) === -1 && n.params)
		// console.log("has " + results.length + " results at page " + page)
		const newNews = await fillData(results)

		dispatch({
			type: "APPEND",
			news: newNews,
		})
	} catch (e) {
		console.log(e)
		dispatch({
			type: "END_REACHED",
		})
	}
}
