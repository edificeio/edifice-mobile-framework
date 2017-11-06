export interface Mail{
    id?: string;
    parent_id?: string;
    subject?: string;
    body: string;
    from?: string;
    fromName?: string;
    to?: string[];
    displayNames?: string[][];
}