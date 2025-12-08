import { IPronoteConnectorInfo } from '~/framework/modules/pronote/model/carnet-de-bord';

export type ICarnetDeBordBackend = (IPronoteConnectorInfo & {
  xmlResponse: string;
})[];
