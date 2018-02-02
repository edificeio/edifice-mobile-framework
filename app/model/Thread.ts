import { PATH_CONVERSATION, PATH_NEW_MESSAGES, PATH_PREVIOUS_MESSAGES } from "../constants/paths"
import { crudReducer } from "./docs"

export interface IThreadModel {
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
}

export interface IThreadState {
	payload: IThreadModel[]
	filterCriteria: null
	synced: boolean
}

const initialState: IThreadState = {
	payload: [
		{
			id: "46c7bc61-b9dd-4c25-b164-fd6252236603",
			parent_id: null,
			subject: "1 utilisateur",
			body: '<br><br><div class="signature new-signature">1 utilisateur: Cindy ONG</div>',
			from: "2bacdfd2-b59c-4b21-a23e-f6346e02fc4a",
			fromName: null,
			to: ["78378bb3-404a-4bc7-aff6-03ae685ec623"],
			toName: null,
			cc: [],
			ccName: null,
			displayNames: [["2bacdfd2-b59c-4b21-a23e-f6346e02fc4a", "Alexandre Pardon"]],
			date: 1516369948114,
			unread: false,
			conversation: null,
			nb: 1,
		},
		{
			id: "13d9d9a3-de67-44c7-8f16-befecb9344da",
			parent_id: null,
			subject: "Categorie 2 utilisateurs",
			body: '<br><br><div class="signature new-signature">Categorie 2 utilisateur</div>',
			from: "2bacdfd2-b59c-4b21-a23e-f6346e02fc4a",
			fromName: null,
			to: ["694-1479825331713"],
			toName: null,
			cc: [],
			ccName: null,
			displayNames: [
				["14a1cb35-e943-4f06-917a-f163461d5b14", "Isabelle Polonio"],
				["2bacdfd2-b59c-4b21-a23e-f6346e02fc4a", "Alexandre Pardon"],
			],
			date: 1515496282666,
			unread: false,
			conversation: "13d9d9a3-de67-44c7-8f16-befecb9344da",
			nb: 0,
		},
		{
			id: "63d9d9a3-de67-4zc7-8f56-befecb9344da",
			parent_id: "13d9d9a3-de67-44c7-8f16-befecb9344da",
			subject: "discussion 2",
			body: '<div class="signature new-signature">discussion à 2<br>initié par Alexandre Pardon</div>',
			from: "2bacdfd2-b59c-4b21-a23e-f6346e02fc4a",
			fromName: null,
			to: ["694-1479825331713"],
			toName: null,
			cc: [],
			ccName: null,
			displayNames: [
				["14a1cb35-e943-4f06-917a-f163461d5b14", "Isabelle Polonio"],
				["2bacdfd2-b59c-4b21-a23e-f6346e02fc4a", "Alexandre Pardon"],
			],
			date: 1514380370906,
			unread: false,
			conversation: "13d9d9a3-de67-44c7-8f16-befecb9344da",
			nb: 0,
		},
		{
			id: "50139a48-1e5b-4fe4-9875-d80a69937069",
			parent_id: "63d9d9a3-de67-44c7-8f56-befecb9344da",
			subject: "Discussion a 2",
			body: '<div class="signature new-signature">Discussion a 2: Isabelle polonio parle</div>',
			from: "14a1cb35-e943-4f06-917a-f163461d5b14",
			fromName: null,
			to: ["78378bb3-404a-4bc7-aff6-03ae685ec623"],
			toName: null,
			cc: [],
			ccName: null,
			displayNames: [
				["14a1cb35-e943-4f06-917a-f163461d5b14", "Isabelle Polonio"],
				["2bacdfd2-b59c-4b21-a23e-f6346e02fc4a", "Alexandre Pardon"],
			],
			date: 1514396821805,
			unread: false,
			conversation: "13d9d9a3-de67-44c7-8f16-befecb9344da",
			nb: 1,
		},
		{
			id: "66c7bc61-b9dd-4c25-b164-fd6252236603",
			parent_id: null,
			subject: "Categorie 3 utilisateur",
			body: '<br><br><div class="signature new-signature">Categorie 3 utilisateur</div>',
			from: "a613dd97-b579-4fe9-a42a-cf9969887e63",
			fromName: null,
			to: ["78378bb3-404a-4bc7-aff6-03ae685ec623"],
			toName: null,
			cc: [],
			ccName: null,
			displayNames: [
				["a613dd97-b579-4fe9-a42a-cf9969887e63", "Madame Dubois"],
				["06a3d090-fa84-4247-86bf-bd2462ec7978", "Ana CAVEL"],
				["2bacdfd2-b59c-4b21-a23e-f6346e02fc4a", "Chantal Masodi."],
			],
			date: 1514380370906,
			unread: false,
			conversation: null,
			nb: 1,
		},
		{
			id: "46c7bc61-b9dd-4c25-b264-fd6252236603",
			parent_id: null,
			subject: "Categorie 4 utilisateurs",
			body: '<br><br><div class="signature new-signature">Categorie 4 utilisateurs</div>',
			from: "a613dd97-b579-4fe9-a42a-cf9969887e63",
			fromName: null,
			to: ["78378bb3-404a-4bc7-aff6-03ae685ec623"],
			toName: null,
			cc: [],
			ccName: null,
			displayNames: [
				["a613dd97-b579-4fe9-a42a-cf9969887e63", "Madame Dubois"],
				["06a3d090-fa84-4247-86bf-bd2462ec7978", "Ana CAVEL"],
				["14a1cb35-e943-4f06-917a-f163461d5b14", "Isabelle Polonio"],
				["2bacdfd2-b59c-4b21-a23e-f6346e02fc4a", "Chantal Masodi."],
			],
			date: 1514380370906,
			unread: false,
			conversation: null,
			nb: 1,
		},
		{
			id: "63d9d9a3-de67-44c7-8f56-befecb9344da",
			parent_id: null,
			subject: "Categorie : discussion 4",
			body: '<div class="signature new-signature">discussion à 4<br>initié par Isabelle Polonio</div>',
			from: "14a1cb35-e943-4f06-917a-f163461d5b14",
			fromName: null,
			to: ["694-1479825331713"],
			toName: null,
			cc: [],
			ccName: null,
			displayNames: [
				["a613dd97-b579-4fe9-a42a-cf9969887e63", "Madame Dubois"],
				["06a3d090-fa84-4247-86bf-bd2462ec7978", "Ana CAVEL"],
				["14a1cb35-e943-4f06-917a-f163461d5b14", "Isabelle Polonio"],
				["2bacdfd2-b59c-4b21-a23e-f6346e02fc4a", "Chantal Masodi."],
			],
			date: 1514380370906,
			unread: false,
			conversation: "63d9d9a3-de67-44c7-8f56-befecb9344da",
			nb: 0,
		},
		{
			id: "50139a48-1e5b-4fe4-9875-d80a69937069",
			parent_id: "63d9d9a3-de67-44c7-8f56-befecb9344da",
			subject: "Discussion a 4",
			body: '<div class="signature new-signature">poloni parle</div>',
			from: "14a1cb35-e943-4f06-917a-f163461d5b14",
			fromName: null,
			to: ["78378bb3-404a-4bc7-aff6-03ae685ec623"],
			toName: null,
			cc: [],
			ccName: null,
			displayNames: [
				["a613dd97-b579-4fe9-a42a-cf9969887e63", "Madame Dubois"],
				["06a3d090-fa84-4247-86bf-bd2462ec7978", "Ana CAVEL"],
				["14a1cb35-e943-4f06-917a-f163461d5b14", "Isabelle Polonio"],
				["2bacdfd2-b59c-4b21-a23e-f6346e02fc4a", "Chantal Masodi."],
			],
			date: 1514396821805,
			unread: false,
			conversation: "63d9d9a3-de67-44c7-8f56-befecb9344da",
			nb: 1,
		},
		{
			id: "be885ce6-8b90-4692-82e6-1d2b55cf6b52",
			parent_id: "50139a48-1e5b-4fe4-9875-d80a69937069",
			subject: "Discussion à 4",
			body: '<br><br><div class="signature new-signature"><b>discussion a 4</b> : chantal masoli parle :)</div>',
			from: "2bacdfd2-b59c-4b21-a23e-f6346e02fc4a",
			fromName: null,
			to: ["e4d5cd13-d44c-4bd8-8f8e-a3e8ad3d2ca5"],
			toName: null,
			cc: [],
			ccName: null,
			displayNames: [
				["a613dd97-b579-4fe9-a42a-cf9969887e63", "Madame Dubois"],
				["06a3d090-fa84-4247-86bf-bd2462ec7978", "Ana CAVEL"],
				["14a1cb35-e943-4f06-917a-f163461d5b14", "Isabelle Polonio"],
				["2bacdfd2-b59c-4b21-a23e-f6346e02fc4a", "Chantal Masodi."],
			],
			date: 1514978935608,
			unread: false,
			conversation: "63d9d9a3-de67-44c7-8f56-befecb9344da",
			nb: 1,
		},
		{
			id: "be885de6-8b90-4692-82e6-1d2b55cf6b52",
			parent_id: "be885ce6-8b90-4692-82e6-1d2b55cf6b52",
			subject: "Discussion à 4",
			body: '<br><br><div class="signature new-signature">Ana Cavel parle</div>',
			from: "06a3d090-fa84-4247-86bf-bd2462ec7978",
			fromName: null,
			to: ["e4d5cd13-d44c-4bd8-8f8e-a3e8ad3d2ca5"],
			toName: null,
			cc: [],
			ccName: null,
			displayNames: [
				["a613dd97-b579-4fe9-a42a-cf9969887e63", "Madame Dubois"],
				["06a3d090-fa84-4247-86bf-bd2462ec7978", "Ana CAVEL"],
				["14a1cb35-e943-4f06-917a-f163461d5b14", "Isabelle Polonio"],
				["2bacdfd2-b59c-4b21-a23e-f6346e02fc4a", "Chantal Masodi."],
			],
			date: 1514978935608,
			unread: false,
			conversation: "63d9d9a3-de67-44c7-8f56-befecb9344da",
			nb: 1,
		},
	],
	filterCriteria: null,
	synced: true,
}

export default (state: IThreadState = initialState, action): IThreadState => {
	if (action.type === "FILTER" && action.path === PATH_CONVERSATION) {
		return action.value === null ? { ...state, filterCriteria: null } : { ...state, filterCriteria: action.value }
	}
	return crudReducer(state, [PATH_CONVERSATION, PATH_PREVIOUS_MESSAGES, PATH_NEW_MESSAGES], action)
}
