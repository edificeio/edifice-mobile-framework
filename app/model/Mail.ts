import { adaptator } from "../infra/HTMLAdaptator"

export class Mail {
	public id?: string
	public parent_id?: string
	public subject?: string
	public body: string
	public from?: string
	public fromName?: string
	public to?: string[]
	public displayNames?: string[][]

	public fromJSON(data) {
		this.body = adaptator(data.body)
			.removeAfter("hr")
			.adapt()
			.toHTML()
	}
}
