export interface IDomaine {
  codification: string;
  degree: number;
  id: number;
  name: string;
  competences?: {
    id: number;
    name: string;
    hidden: boolean;
  }[];
  domaines?: IDomaine[];
}
