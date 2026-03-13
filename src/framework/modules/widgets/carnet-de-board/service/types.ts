import { IPronoteConnectorInfo } from '~/framework/modules/widgets/carnet-de-board/model/carnet-de-bord';

export type ICarnetDeBordBackend = (IPronoteConnectorInfo & {
  xmlResponse: string;
})[];
