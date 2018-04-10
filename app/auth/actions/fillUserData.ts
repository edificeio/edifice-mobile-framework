import { read } from "../../infra/Cache";
import { Me } from "../../infra/Me";

let dataFilled = false;
export const fillUserData = async () => {
	if(dataFilled){
		return;
	}
	const data = await read(`/directory/user/${ Me.session.userId }`);
	for(let prop in data){
		Me.session[prop] = data[prop];
	}
	dataFilled = true;
}