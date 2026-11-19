/**
 * Rules of the form of « Aide et support »: who can create a ticket, the choices of its pickers, when it can be sent.
 * What they need to know of the app (translations, rights of the session) is given to them.
 */
import type { TicketChoice, TicketDraft } from '~/framework/modules/support/model';

/** Workflow right that creates a ticket. */
export const CREATE_TICKET_RIGHT = 'net.atos.entng.support.controllers.TicketController|createTicket';

/** Longest subject of a ticket. */
export const SUBJECT_MAX_LENGTH = 255;

/** Category of a ticket about no app of the list. */
export const OTHER_CATEGORY = 'other';

/** Whether the user can create a ticket: he has its workflow right (`authorizedActions` of the session). */
export const canCreateTicket = (authorizedActions: readonly { name: string }[]): boolean =>
  authorizedActions.some(action => action.name === CREATE_TICKET_RIGHT);

/** Whether the ticket can be sent: it has a subject, not too long, and a description. */
export const canSendTicket = ({ description, subject }: Pick<TicketDraft, 'description' | 'subject'>): boolean =>
  subject !== '' && subject.length <= SUBJECT_MAX_LENGTH && description !== '';

/** What the category picker needs of an app of the session (`session.rights.apps`). */
interface CategoryApp {
  address: string;
  displayName: string;
  name: string;
}

/** What the category picker needs to know of the app. */
interface CategoryLabels {
  /** The translation of a key, `undefined` if there is none. */
  translate: (key: string) => string | undefined;
  /** The label of an app translated by the server (« Mes applis »), by the name of the app; `undefined` if unknown. */
  getServerLabel: (appName: string) => string | undefined;
}

/**
 * Label of an app in the category picker, the first one that exists of:
 * 1. the one `support` gives it (key `support-createticket-category-<displayName>`);
 * 2. its label translated by the server;
 * 3. its `displayName` (often a key of translation of the server, such as `admin.title`).
 */
export const getCategoryLabel = (
  app: Pick<CategoryApp, 'displayName' | 'name'>,
  { getServerLabel, translate }: CategoryLabels,
): string =>
  translate(`support-createticket-category-${app.displayName.toLowerCase()}`) ?? getServerLabel(app.name) ?? app.displayName;

/**
 * Choices of the category picker: the apps of the user that have an address and a name (labels: `getCategoryLabel`), and
 * « other », sorted by label without case. The value of an app is its address.
 * @param otherLabel the label of « other ».
 */
export const getTicketCategories = (
  apps: readonly CategoryApp[],
  { otherLabel, ...labels }: CategoryLabels & { otherLabel: string },
): TicketChoice[] =>
  [
    ...apps.filter(app => app.address && app.name).map(app => ({ label: getCategoryLabel(app, labels), value: app.address })),
    { label: otherLabel, value: OTHER_CATEGORY },
  ].sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));

/** Choices of the structure picker: the structures of the user. */
export const getStructureChoices = (structures: readonly { id: string; name: string }[] = []): TicketChoice[] =>
  structures.map(structure => ({ label: structure.name, value: structure.id }));
