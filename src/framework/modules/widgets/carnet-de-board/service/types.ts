import { IPronoteConnectorInfo } from '~/framework/modules/widgets/carnet-de-board/model';

export type ICarnetDeBordBackend = (IPronoteConnectorInfo & {
  xmlResponse: string;
})[];
