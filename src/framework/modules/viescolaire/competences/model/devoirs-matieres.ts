import { IDevoir } from './devoir';
import { IMatiere } from './matiere';

export interface IDevoirsMatieres {
  devoirs: IDevoir[];
  matieres: IMatiere[];
}
