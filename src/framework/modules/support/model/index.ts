/**
 * Model of « Aide et support »: the ticket that the user writes in the form, and the choices of its pickers. Its rules are in
 * `business.ts`.
 */

/** A choice of a picker of the form: a category (an app of the user, or « other »), or a structure. */
export interface TicketChoice {
  label: string;
  value: string;
}

/** What the user writes in the form. */
export interface TicketDraft {
  /** Address of the app concerned (« /blog »), or « other ». */
  category: string;
  /** Id of the structure concerned. */
  structure: string;
  subject: string;
  description: string;
}

/**
 * An attachment of the ticket, once sent to the workspace: what the ticket needs of it. A `SyncedFileWithId` of
 * `~/framework/util/fileHandler` (what the upload gives) is one.
 */
export interface TicketAttachment {
  filename: string;
  df: { id: string; filesize?: number };
}
