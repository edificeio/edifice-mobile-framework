import { Conf } from "../Conf"

import { Mix } from "entcore-toolkit"
import { READ_SUCCESS } from "../constants/docs"
import { matchs, PATH_DOCUMENT } from "../constants/paths"
import { Document } from "../entcore/workspace"

const initialState: DocumentState = {
	payload: [],
	synced: true,
}

export interface DocumentState {
	payload: Array<Document>
	synced: boolean
}

export function Documents(state: DocumentState = initialState, action): DocumentState {
	if (matchs([PATH_DOCUMENT], action.path) && action.type === READ_SUCCESS) {
		return {
			synced: true,
			payload: action.payload === 0 ? [] : Mix.castArrayAs(Document, action.payload.filter(doc => doc.folder !== "Trash")),
		}
	}
	return state
}

export class DocFile {
	public uri: string
	public base64: string
	public path: string

	public async openCamera() {
		/*const pickerResult = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 0.7
        });
        
        this.uri = pickerResult.uri;
        this.base64 = pickerResult.base64*/
	}

	public async uploadImage() {
		const uriParts = this.uri.split(".")
		const fileType = this.uri[this.uri.length - 1]

		const formData = new FormData()
		formData.append("photo", {
			uri: this.uri,
			name: `photo.${fileType}`,
			type: `image/${fileType}`,
		} as any)

		const response = await fetch(`${Conf.platform}/workspace/document?protected=true&application=media-library`, {
			method: "POST",
			body: formData,
			headers: {
				Accept: "application/json",
				"Content-Type": "multipart/form-data",
			} as any,
		})
		const file = await response.json()
		this.path = `${Conf.platform}/workspace/document/${file._id}`
	}
}
