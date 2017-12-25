import { adaptator } from '../infra/HTMLAdaptator';

export class Mail{
    id?: string;
    parent_id?: string;
    subject?: string;
    body: string;
    from?: string;
    fromName?: string;
    to?: string[];
    displayNames?: string[][];

    fromJSON(data){
        this.body = adaptator(data.body)
            .removeAfter('hr')
            .adapt()
            .toHTML();
    }
}