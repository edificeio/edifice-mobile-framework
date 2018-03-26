import { MessageStatus } from "./MessageStatus";

export interface Message{
	body: string
	cc: string[]
	ccName: string
	conversation: string
	date: number
	displayNames: string[][]
	from: string
	fromName: string
	id: string
	nb: number
	parent_id: string
	subject: string
	to: string[]
	toName: string
	unread: boolean
	status: MessageStatus;
	userId: string;
	parentId: string;
	thread_id: string;
	newId: string;
}