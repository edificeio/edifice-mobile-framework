import { uploadImage, takePhoto } from "../../actions/workspace";
import { Me } from "../../infra/Me";
import { Conf } from "../../Conf";

export const sendPhoto = dispatch => async (data: { subject: string, to: any[], cc:any[], parentId?: string, body?: string }) => {
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
		const response = await fetch(`${ Conf.platform }/conversation/send?In-Reply-To=${data.parentId}`, {
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				body: `<div><img src="${documentPath}" /></div>`,
				to: data.to,
				cc: data.cc,
				subject: data.subject
			})
		});
		let json = await response.json();

		dispatch({
			type: 'CONVERSATION_SENT',
			data: data
		});
	}
	catch(e){
		console.log(e);
		dispatch({
			type: 'CONVERSATION_FAILED_SEND',
			data: data
		});
	}
}