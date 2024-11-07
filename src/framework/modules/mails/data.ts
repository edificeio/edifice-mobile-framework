import { IMailsFolder } from './model';

export const mailsListData = [
  {
    cc: [],
    cci: [
      {
        displayName: 'Wesley Ron',
        id: '0afae690-7a12-4419-bbb5-ae6ebaed4fe0',
        type: 'Teacher',
      },
    ],
    date: 1730195314943,
    from: {
      displayName: 'Rusard Argus',
      id: 'd776c4ce-4f43-4352-8597-954f0237cd4d',
      type: 'Guest',
    },
    hasAttachment: true,
    id: '88bee480-66ff-44e1-a7f5-532bb0aa4f2c',
    state: 'DRAFT',
    subject: "Tr: Okay j'ai pigé",
    to: [
      {
        displayName: 'Albus Prod poudlard',
        id: '0afae690-7a12-4419-bbb5-ae6ebaed4fe0',
        type: 'Teacher',
      },
      {
        displayName: 'Wesley Molly',
        id: '0afae690-7a12-4419-bbb5-ae6ebaed4fe0',
        type: 'Teacher',
      },
    ],
    type: '',
    unread: false,
  },
  {
    cc: [],
    cci: [],
    date: 1730195314943,
    from: {
      displayName: 'Rusard Argus',
      id: 'd776c4ce-4f43-4352-8597-954f0237cd4d',
      type: 'Guest',
    },
    hasAttachment: false,
    id: '88bee480-66ff-44e1-a7f5-532bb0aa4f2c',
    state: 'SENT',
    subject: "Tr: Okay j'ai pigé",
    to: [
      {
        displayName: 'Albus Prod poudlard',
        id: '0afae690-7a12-4419-bbb5-ae6ebaed4fe0',
        type: 'Teacher',
      },
    ],
    type: 'ANSWERED',
    unread: false,
  },
  {
    cc: [],
    cci: [],
    date: 1730195314943,
    from: {
      displayName: 'Rusard Argus',
      id: 'd776c4ce-4f43-4352-8597-954f0237cd4d',
      type: 'Guest',
    },
    hasAttachment: false,
    id: '88bee480-66ff-44e1-a7f5-532bb0aa4f2c',
    state: 'SENT',
    subject: "Tr: Okay j'ai pigé",
    to: [
      {
        displayName: 'Albus Prod poudlard',
        id: '0afae690-7a12-4419-bbb5-ae6ebaed4fe0',
        type: 'Teacher',
      },
    ],
    type: '',
    unread: true,
  },
];

export const mailsFoldersData: IMailsFolder[] = [
  {
    depth: 1,
    id: 'test',
    name: 'Dossier 1',
    nbUnread: 29,
    parent_id: null,
    skip_uniq: false,
    subfolders: [
      {
        depth: 2,
        id: 'test-4',
        name: 'Sous-dossier 1',
        nbUnread: 29,
        parent_id: 'test',
        skip_uniq: false,
        subfolders: [
          {
            depth: 3,
            id: 'test-10',
            name: 'Sous-dossier 10',
            nbUnread: 29,
            parent_id: null,
            skip_uniq: false,
            trashed: false,
            user_id: 'user-id',
          },
        ],
        trashed: false,
        user_id: 'user-id',
      },
      {
        depth: 2,
        id: 'test-20',
        name: 'Sous-dossier 5 dhezhjdezhjndjezndjezndjezn jdnez jdnejznd jz',
        nbUnread: 29,
        parent_id: 'test',
        skip_uniq: false,
        trashed: false,
        user_id: 'user-id',
      },
    ],
    trashed: false,
    user_id: 'user-id',
  },
  {
    depth: 1,
    id: 'test-2',
    name: 'Dossier 2',
    nbUnread: 29,
    parent_id: null,
    skip_uniq: false,
    trashed: false,
    user_id: 'user-id',
  },
];

export const mailsDetailsData = {
  attachments: [],
  body: '<div class="ng-scope">Bonjour, je vous envoie un message pour vous prévenir que Ginny est malade.</div><div>Je lemmène chez le médecin ce matin. Je vous recontacte très vite.&nbsp;</div><div>​</div><div>Bonne journée</div><div class="signature new-signature ng-scope"></div>',
  cc: [],
  cci: [],
  date: 1692257569338,
  from: { displayName: 'WEASLEY molly', id: '6ed2b8a3-3868-44cc-a6fb-49b2f6ff9f66', type: 'Relative' },
  id: 'b7ddb093-598d-423f-85b3-ddac9357b277',
  language: 'fr',
  parent_id: null,
  state: 'SENT',
  subject: 'Absence de Ginny',
  text_searchable: '',
  thread_id: 'b7ddb093-598d-423f-85b3-ddac9357b277',
  to: [
    { displayName: 'Albus Prod', id: '0afae690-7a12-4419-bbb5-ae6ebaed4fe0', type: 'Teacher' },
    { displayName: 'Rogue Severus', id: '0afae690-7a12-4419-bbb5-ae6ebaed4fe0', type: 'Teacher' },
  ],
};
