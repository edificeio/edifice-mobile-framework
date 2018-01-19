
export interface ConversationModel {
	id: string,
    subject: string
    body: string
	date: number
	displayNames: string[][]
	nb: number
}

const initialState = {
	payload: [
        {
            "id": "46c7bc61-b9dd-4c25-b164-fd6252236603",
            "parent_id": null,
            "subject": "Notes?",
            "body": "<br><br><div class=\"signature new-signature\">Etes vous favorable <br>aux notes</div>",
            "from": "aa34467e-e188-4c70-a238-48c02b72179a",
            "fromName": null,
            "to": [
                "78378bb3-404a-4bc7-aff6-03ae685ec623"
            ],
            "toName": null,
            "cc": [],
            "ccName": null,
            "displayNames": [
                [
                    "aa34467e-e188-4c70-a238-48c02b72179a",
                    "Cindy ONG"
                ],
            ],
            "date": 1516369948114,
            "unread": false,
            "conversation": null,
            "nb": 1
        },
        {
            "id": "63d9d9a3-de67-44c7-8f56-befecb9344da",
            "parent_id": null,
            "subject": "Libre discussion",
            "body": "<br><br><div class=\"signature new-signature\">Poser vos idées</div>",
            "from": "aa34467e-e188-4c70-a238-48c02b72179a",
            "fromName": null,
            "to": [
                "694-1479825331713"
            ],
            "toName": null,
            "cc": [],
            "ccName": null,
            "displayNames": [
                [
                    "aa34467e-e188-4c70-a238-48c02b72179a",
                    "Cindy ONG"
                ],
                [
                    "f825df70-3c85-4a95-8d3e-6b7035fec059",
                    "Alexandre Pardon"
                ]
            ],
            "date": 1515496282666,
            "unread": false,
            "conversation": "63d9d9a3-de67-44c7-8f56-befecb9344da",
            "nb": 0
        },
        {
            "id": "63d9d9a3-de67-44c7-8f56-befecb9344da",
            "parent_id": null,
            "subject": "Périscolaire",
            "body": "<div class=\"signature new-signature\">Les activités que vous souhaiteriez?</div>",
            "from": "78378bb3-404a-4bc7-aff6-03ae685ec623",
            "fromName": null,
            "to": [
                "694-1479825331713"
            ],
            "toName": null,
            "cc": [],
            "ccName": null,
            "displayNames": [
                [
                    "aa34467e-e188-4c70-a238-48c02b72179a",
                    "Cindy ONG"
                ],
                [
                    "cc8ba9e5-63e1-4e21-9a74-8cb914c1f737",
                    "Pierre Duval"
                ],
                [
                    "f825df70-3c85-4a95-8d3e-6b7035fec059",
                    "Ana CAVEL"
                ]
            ],
            "date": 1514380370906,
            "unread": false,
            "conversation": "63d9d9a3-de67-44c7-8f56-befecb9344da",
            "nb": 0
        },
        {
            "id": "46c7bc61-b9dd-4c25-b164-fd6252236603",
            "parent_id": null,
            "subject": "Rentrée des classes",
            "body": "<br><br><div class=\"signature new-signature\">Pour les 6ième et 5ième</div>",
            "from": "aa34467e-e188-4c70-a238-48c02b72179a",
            "fromName": null,
            "to": [
                "78378bb3-404a-4bc7-aff6-03ae685ec623"
            ],
            "toName": null,
            "cc": [],
            "ccName": null,
            "displayNames": [
                [
                    "aa34467e-e188-4c70-a238-48c02b72179a",
                    "Cindy ONG"
                ],
                [
                    "f825df70-3c85-4a95-8d3e-6b7035fec059",
                    "Ana CAVEL"
                ],
                [
                    "f825df70-3c85-4a95-8d3e-6b7035fec059",
                    "Isabelle Polonio"
                ],
                [
                    "cc8ba9e5-63e1-4e21-9a74-8cb914c1f737",
                    "Chantal Masodi."
                ],
            ],
            "date": 1514380370906,
            "unread": false,
            "conversation": null,
            "nb": 1
        },
	],
    filter: null,
	synced: true,
}

export interface ConversationState {
	payload: Array<ConversationModel>
    filter: null,
	synced: boolean
}

export const conversations = (state: ConversationState = initialState, action) : ConversationState =>{
    if (action.type === "FILTER" && action.storeName === "conversations")
        return (action.value === null) ? { ...state, filter: undefined} : { ...state, filter: action.value}
	return state
}



