/**
 * Formats of the API of « Aide et support ». They don't leave `service/`: the service takes and gives types of the model (see
 * `adapter.ts`).
 */
export namespace API {
  /** Body of `POST /support/ticket`. */
  export interface CreateTicketBody {
    /** Documents of the workspace, sent before the ticket. */
    attachments?: { id: string; name: string; size?: number }[];
    /** Address of the app concerned, or « other ». */
    category: string;
    description: string;
    /** Id of the structure. */
    school_id: string;
    subject: string;
  }

  /** Response of `POST /support/ticket`: the ticket created. */
  export interface TicketResponse {
    id: number | null;
    school_id: string;
    status: number;
    created: string;
    modified: string;
    escalation_status: number;
    escalation_date: string | null;
    short_desc: string;
    owner_name: string;
    owner: string;
  }
}
