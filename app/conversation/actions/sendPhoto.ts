
import { Me } from "../../infra/Me";
import { Conf } from "../../Conf";
import { Message } from "../interfaces";
import { takePhoto, uploadImage } from "../../infra/actions/workspace";

export const sendPhoto = dispatch => async (data: Message) => {
	const uri = await takePhoto();
	
	dispatch({
		type: 'CONVERSATION_SEND',
		data: { 
			...data, 
			conversation: data.parentId, 
			from: Me.session.userId, 
			body: `<div><img src="${uri}" /></div>`,
			date: Date.now()
		}
	});
	
	try{
		const documentPath = await uploadImage(uri);
		const body = `<div><img src="${documentPath}" /></div>`;

		let replyTo = '';
		if(data.parentId){
			replyTo = 'In-Reply-To=' + data.parentId;
		}
		
		const response = await fetch(`${Conf.platform}/conversation/send?${ replyTo }`, {
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				body: body,
				to: data.to,
				cc: data.cc,
				subject: data.subject
			})
		});
		let json = await response.json();

		dispatch({
			type: 'CONVERSATION_SENT',
			data: {
				...data,
				body: body,
				newId: json.id,
				conversation: data.parentId,
				date: Date.now(), 
				from: Me.session.userId
			}
		});
	}
	catch(e){
		console.log(e);
		dispatch({
			type: 'CONVERSATION_FAILED_SEND',
			data: data,
			body: '<div></div>',
			conversation: data.parentId,
			date: Date.now(), 
			from: Me.session.userId
		});
	}
}