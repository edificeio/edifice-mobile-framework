import http from "axios"
import { Eventer, Mix, Selectable, Selection } from "entcore-toolkit"
import moment from "moment/src/moment.js"
import { Conf } from "../Conf"
import { Behaviours } from "./behaviours"
import { Me } from "./me"
import { model } from "./modelDefinitions"
import { Rights, Shareable } from "./rights"

const maxFileSize = Infinity //

class Quota {
	public max: number
	public used: number
	public unit: string

	constructor() {
		this.max = 1
		this.used = 0
		this.unit = "Mo"
	}

	public appropriateDataUnit(bytes: number) {
		var order = 0
		var orders = {
			0: "Octets",
			1: "Ko",
			2: "Mo",
			3: "Go",
			4: "To",
		}
		var finalNb = bytes
		while (finalNb >= 1024 && order < 4) {
			finalNb = finalNb / 1024
			order++
		}
		return {
			nb: finalNb,
			order: orders[order],
		}
	}

	public async refresh(): Promise<void> {
		const response = await http.get(`${Conf.platform}/workspace/quota/user/${model.me.userId}`)
		const data = response.data
		//to mo
		data.quota = data.quota / (1024 * 1024)
		data.storage = data.storage / (1024 * 1024)

		if (data.quota > 2000) {
			data.quota = Math.round(data.quota / 1024 * 10) / 10
			data.storage = Math.round(data.storage / 1024 * 10) / 10
			this.unit = "Go"
		} else {
			data.quota = Math.round(data.quota)
			data.storage = Math.round(data.storage)
		}

		this.max = data.quota
		this.used = data.storage
	}
}

export let quota = new Quota()

export class Revision {}

export enum DocumentStatus {
	initial = "initial",
	loaded = "loaded",
	failed = "failed",
	loading = "loading",
}

export class Document implements Selectable, Shareable {
	public title: string
	public _id: string
	public created: any
	public path: string
	public metadata: {
		"content-type"?: string
		role?: string
		extension?: string
		filename?: string
		size?: number
	} = {}
	public newProperties: {
		name?: string
		legend?: string
		alt?: string
	} = {}
	public version: number
	public link: string
	public icon: string
	public owner: {
		userId: string
		displayName: string
	}
	public eventer = new Eventer()
	public revisions: Revision[]
	public status: DocumentStatus
	public selected: boolean
	public currentQuality: number
	public hiddenBlob: Blob
	public rights: Rights<Document> = new Rights(this)
	private xhr: XMLHttpRequest
	public shared: any
	public alt: string
	public legend: string
	public name: string

	public toJSON() {
		return {
			title: this.title,
			_id: this._id,
			created: this.created,
			path: this.path,
			metadata: this.metadata,
			version: this.version,
			link: this.link,
			icon: this.icon,
			owner: this.owner,
		}
	}

	get myRights() {
		return this.rights.myRights
	}

	public async delete() {
		await http.delete(`${Conf.platform}/workspace/document/${this._id}`)
	}

	public abort() {
		if (this.xhr) {
			this.xhr.abort()
		}
	}

	get size(): string {
		const koSize = this.metadata.size / 1024
		if (koSize > 1024) {
			return parseInt(koSize / 1024 * 10) / 10 + " Mo"
		}
		return Math.ceil(koSize) + " Ko"
	}

	public async loadProperties() {
		const response = await http.get(`${Conf.platform}/workspace/document/properties/${this._id}`)
		var dotSplit = response.data.name.split(".")
		this.metadata.extension = dotSplit[dotSplit.length - 1]
		if (dotSplit.length > 1) {
			dotSplit.length = dotSplit.length - 1
		}

		this.alt = response.data.alt
		this.newProperties.alt = response.data.alt
		this.legend = response.data.legend
		this.newProperties.legend = response.data.legend
		this.title = dotSplit.join(".")
		this.newProperties.name = response.data.name.replace("." + this.metadata.extension, "")
		this.metadata.role = this.role()
	}

	get differentProperties() {
		if (!this.name) {
			this.name = this.title.replace("." + this.metadata.extension, "")
		}
		let diff = false
		for (const prop in this.newProperties) {
			diff = diff || this.newProperties[prop] !== this[prop]
		}
		return diff
	}

	public async saveChanges() {
		if (this.differentProperties && this.myRights.renameDocument) {
			this.name = this.newProperties.name
			this.alt = this.newProperties.alt
			this.legend = this.newProperties.legend
			await http.put(`${Conf.platform}/workspace/rename/document/${this._id}`, this.newProperties)
		}

		await this.applyBlob()
	}

	public async applyBlob() {
		if (this.hiddenBlob) {
			await this.update(this.hiddenBlob)
			this.hiddenBlob = undefined
		}
	}

	public resetNewProperties() {
		this.newProperties.alt = this.alt
		this.newProperties.legend = this.legend
		if (!this.name) {
			this.name = this.title
		}
		this.newProperties.name = this.name.replace("." + this.metadata.extension, "")
	}

	public fromJSON(data) {
		if (!data) {
			this.status = DocumentStatus.initial
			return
		}

		this.status = DocumentStatus.loaded

		if (data.metadata) {
			var dotSplit = data.metadata.filename.split(".")
			this.metadata.extension = dotSplit[dotSplit.length - 1]
			if (dotSplit.length > 1) {
				dotSplit.length = dotSplit.length - 1
			}

			this.title = dotSplit.join(".")
			this.metadata.role = this.role()
			this.resetNewProperties()
		}

		if (data.created) {
			this.created = moment(data.created.split(".")[0])
		} else if (data.sent) {
			this.created = moment(data.sent.split(".")[0])
		} else {
			this.created = moment()
		}

		this.owner = { userId: data.owner, displayName: data.ownerName }

		this.version = parseInt(Math.random() * 100)
		this.link = `${Conf.platform}/workspace/document/` + this._id
		if (this.metadata && this.metadata.role === "img") {
			this.icon = this.link
		}
		this.revisions = []
	}

	public async refreshHistory() {
		const response = await http.get("document/" + this._id + "/revisions")
		const revisions = response.data
		this.revisions = Mix.castArrayAs(Revision, revisions)
	}

	get isEditableImage() {
		const editables = ["jpg", "jpeg", "bmp", "png"]
		const ext = this.metadata["content-type"].split("/")[1].toLowerCase()
		return (
			editables.indexOf(ext) !== -1 && this.status !== DocumentStatus.loading && this.status !== DocumentStatus.failed
		)
	}

	public upload(file: File | Blob, visibility?: "public" | "protected" | "owner"): Promise<any> {
		var visibilityPath = ""
		if (!visibility) {
			visibility = "protected"
		}
		if (visibility === "public" || visibility === "protected") {
			visibilityPath = visibility + "=true&application=media-library"
		}
		if (!this.metadata || !this.metadata["content-type"]) {
			const nameSplit = file.name.split(".")
			this.metadata = {
				"content-type": file.type || "application/octet-stream",
				filename: file.name,
				size: file.size,
				extension: nameSplit[nameSplit.length - 1],
			}
			this.metadata.role = this.role()
		}
		this.status = DocumentStatus.loading
		const formData = new FormData()
		formData.append("file", file, file.name)
		this.title = file.name
		this.newProperties.name = this.title.replace("." + this.metadata.extension, "")
		this.xhr = new XMLHttpRequest()
		let path = `${Conf.platform}/workspace/document?${visibilityPath}`
		if (this.role() === "img") {
			path += "&quality=1&" + MediaLibrary.thumbnails
		}
		this.xhr.open("POST", path)

		this.xhr.send(formData)
		this.xhr.onprogress = e => {
			this.eventer.trigger("progress", e)
		}

		return new Promise((resolve, reject) => {
			this.xhr.onload = async () => {
				if (this.xhr.status >= 200 && this.xhr.status < 400) {
					this.eventer.trigger("loaded")
					this.status = DocumentStatus.loaded
					const result = JSON.parse(this.xhr.responseText)
					this._id = result._id
					this.owner = {
						userId: Me.session.userId,
						displayName: Me.session.username,
					}
					await this.rights.fromBehaviours("workspace")
					if (this.path) {
						http.put("documents/move/" + this._id + "/" + encodeURIComponent(this.path)).then(() => {
							resolve()
						})
					} else {
						resolve()
					}
				} else {
					this.eventer.trigger("error")
					this.status = DocumentStatus.failed
				}
			}
		})
	}

	public role() {
		return Document.role(this.metadata["content-type"])
	}

	public protectedDuplicate(callback?: (document: Document) => void): Promise<Document> {
		return new Promise((resolve, reject) => {
			Behaviours.applicationsBehaviours.workspace.protectedDuplicate(this, function(data) {
				resolve(Mix.castAs(Document, data))
			})
		})
	}

	public publicDuplicate(callback?: (document: Document) => void) {
		return new Promise((resolve, reject) => {
			Behaviours.applicationsBehaviours.workspace.publicDuplicate(this, function(data) {
				resolve(Mix.castAs(Document, data))
			})
		})
	}

	public async update(blob: Blob) {
		const formData = new FormData()
		let newName = this.name || this.title
		if (newName.indexOf(this.metadata.extension) === -1) {
			newName += "." + this.metadata.extension
		}
		formData.append("file", blob, newName)
		await http.put(`${Conf.platform}/workspace/document/${this._id}?${MediaLibrary.thumbnails}&quality=1`, formData)
		this.currentQuality = 1
		this.version = Math.floor(Math.random() * 100)
		this.eventer.trigger("save")
	}

	public static role(fileType) {
		if (!fileType) return "unknown"

		var types = {
			doc(type) {
				return type.indexOf("document") !== -1 && type.indexOf("wordprocessing") !== -1
			},
			xls(type) {
				return (type.indexOf("document") !== -1 && type.indexOf("spreadsheet") !== -1) || type.indexOf("ms-excel") !== -1
			},
			img(type) {
				return type.indexOf("image") !== -1
			},
			pdf(type) {
				return type.indexOf("pdf") !== -1 || type === "application/x-download"
			},
			ppt(type) {
				return (type.indexOf("document") !== -1 && type.indexOf("presentation") !== -1) || type.indexOf("powerpoint") !== -1
			},
			video(type) {
				return type.indexOf("video") !== -1
			},
			audio(type) {
				return type.indexOf("audio") !== -1
			},
			zip(type) {
				return (
					type.indexOf("zip") !== -1 || type.indexOf("rar") !== -1 || type.indexOf("tar") !== -1 || type.indexOf("7z") !== -1
				)
			},
		}

		for (const type in types) {
			if (types[type](fileType)) {
				return type
			}
		}

		return "unknown"
	}

	public async trash(): Promise<any> {
		const response = await http.put(`${Conf.platform}/workspace/document/trash/${this._id}`)
	}
}

export class Folder implements Selectable {
	public selected: boolean
	public folders = new Selection<Folder>([])
	public documents = new Selection<Document>([])
	public folder: string
	public owner: string

	public deselectAll() {
		this.documents.forEach(d => (d.selected = false))
		this.folders.all.forEach(f => f.deselectAll())
	}

	public closeFolder() {
		this.folders.all = []
	}

	public addFolders() {
		this.folders.addRange(
			Mix.castArrayAs(
				Folder,
				MediaLibrary.foldersStore.filter(folder => folder.folder.indexOf(this.folder + "_" + folder.name) !== -1)
			)
		)
	}

	public isOpened(currentFolder: Folder) {
		return (
			currentFolder &&
			((currentFolder.folder && currentFolder.folder.indexOf(this.folder) !== -1) ||
				(this instanceof MyDocuments && currentFolder.owner === model.me.userId) ||
				currentFolder === this)
		)
	}

	public async sync() {
		this.folders.all.splice(0, this.folders.all.length)
		this.addFolders()
		this.folders.all.forEach(f => f.addFolders())
		const response = await http.get(`${Conf.platform}/workspace/documents/${this.folder}?filter=owner&hierarchical=true`)
		this.documents.all.splice(0, this.documents.all.length)
		this.documents.addRange(Mix.castArrayAs(Document, response.data.filter(doc => doc.folder !== "Trash")))
	}
}

export class MyDocuments extends Folder {
	public async sync() {
		const response = await http.get(`${Conf.platform}/workspace/folders/list?filter=owner`)
		this.folders.all.splice(0, this.folders.all.length)
		MediaLibrary.foldersStore = response.data
		this.folders.addRange(Mix.castArrayAs(Folder, response.data.filter(folder => folder.folder.indexOf("_") === -1)))
		this.folders.all.forEach(f => f.addFolders())
		this.documents.all.splice(0, this.documents.all.length)
		const docResponse = await http.get(`${Conf.platform}/workspace/documents?filter=owner&hierarchical=true`)
		this.documents.addRange(Mix.castArrayAs(Document, docResponse.data.filter(doc => doc.folder !== "Trash")))
		MediaLibrary.eventer.trigger("sync")
	}
}

class SharedDocuments extends Folder {
	public async sync() {
		const docResponse = await http.get(`${Conf.platform}/workspace/documents?filter=shared`)
		this.documents.all.splice(0, this.documents.all.length)
		this.documents.addRange(Mix.castArrayAs(Document, docResponse.data.filter(doc => doc.folder !== "Trash")))
		MediaLibrary.eventer.trigger("sync")
	}
}

class AppDocuments extends Folder {
	public async sync() {
		const docResponse = await http.get(`${Conf.platform}/workspace/documents?filter=protected`)
		this.documents.all.splice(0, this.documents.all.length)
		this.documents.addRange(Mix.castArrayAs(Document, docResponse.data.filter(doc => doc.folder !== "Trash")))
		MediaLibrary.eventer.trigger("sync")
	}
}

class PublicDocuments extends Folder {
	public async sync() {
		const docResponse = await http.get(`${Conf.platform}/workspace/documents?filter=public`)
		this.documents.all.splice(0, this.documents.all.length)
		this.documents.addRange(Mix.castArrayAs(Document, docResponse.data.filter(doc => doc.folder !== "Trash")))
		MediaLibrary.eventer.trigger("sync")
	}
}

export class MediaLibrary {
	public static myDocuments = new MyDocuments()
	public static sharedDocuments = new SharedDocuments()
	public static appDocuments = new AppDocuments()
	public static publicDocuments = new PublicDocuments()
	public static eventer = new Eventer()
	public static foldersStore = []

	public static thumbnails = "thumbnail=120x120&thumbnail=100x100&thumbnail=290x290&thumbnail=381x381&thumbnail=1600x0"

	public static deselectAll() {
		MediaLibrary.appDocuments.deselectAll()
		MediaLibrary.sharedDocuments.deselectAll()
		MediaLibrary.myDocuments.deselectAll()
	}

	public static async upload(file: File | Blob, visibility?: "public" | "protected"): Promise<Document> {
		if (!visibility) {
			visibility = "protected"
		}

		const doc = new Document()
		await doc.upload(file, visibility)
		return doc
	}
}
