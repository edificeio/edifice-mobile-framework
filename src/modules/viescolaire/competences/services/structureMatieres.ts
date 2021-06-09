/* eslint-disable flowtype/no-types-missing-file-annotation */
import { fetchJSONWithCache } from "../../../../infra/fetchWithCache";
import { IStructureMatiereList } from "../state/structureMatieres";

export type IStructureMatiereListBackend = {
  id: string;
  name: string;
}[];

const structureMatieresAdapter: (data: IStructureMatiereListBackend) => IStructureMatiereList = data => {
  let result = [] as IStructureMatiereList;
  if (!data) return result;
  result = data.map(item => ({
    id: item.id,
    name: item.name,
  }));
  return result;
};

export const StructureMatiereListService = {
  getStructureMatiereList: async (idStructure: string) => {
    return structureMatieresAdapter(await fetchJSONWithCache(`/viescolaire/matieres?idEtablissement=${idStructure}`));
  },
};
