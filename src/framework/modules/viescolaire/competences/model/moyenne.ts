export interface IMoyenne {
  matiere: string;
  matiere_coeff: number;
  matiere_rank: number;
  teacher: string;
  moyenne: string;
  devoirs: {
    note: string;
    diviseur: number;
    name: string;
    coefficient: number;
    is_evaluated: boolean;
    libelle_court: string;
  }[];
}
