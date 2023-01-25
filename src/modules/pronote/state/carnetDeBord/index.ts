import moment from 'moment';

export enum CarnetDeBordSection {
  CAHIER_DE_TEXTES = 1, // No falsy values in this
  NOTES,
  COMPETENCES,
  VIE_SCOLAIRE,
}

export type IPronoteConnectorInfo = {
  structureId: string;
  address: string;
};

export type IUserBasic = {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  idPronote: string;
};

export type ICarnetDeBord = IUserBasic &
  IPronoteConnectorInfo & {
    PageCahierDeTextes: {
      Titre: string;
      CahierDeTextes?: ICarnetDeBordCahierDeTextes[];
    };
    PageCompetences: {
      Titre: string;
      Competences?: (ICarnetDeBordCompetencesEvaluation | ICarnetDeBordCompetencesItem | ICarnetDeBordCompetencesDomaine)[];
    };
    PageReleveDeNotes: {
      Titre: string;
      Message?: string;
      Devoir?: ICarnetDeBordReleveDeNotesDevoir[];
    };
    PageVieScolaire: {
      Titre: string;
      VieScolaire?: (
        | ICarnetDeBordVieScolaireAbsence
        | ICarnetDeBordVieScolaireRetard
        | ICarnetDeBordVieScolairePassageInfirmerie
        | ICarnetDeBordVieScolairePunition
        | ICarnetDeBordVieScolaireSanction
        | ICarnetDeBordVieScolaireObservation
      )[];
    };
    PagePronote?: {
      [pageName: string]: string;
    };
  };

export type ICarnetDeBordCahierDeTextes = {
  Date: moment.Moment;
  DateString: string;
  Matiere?: string;
  TravailAFaire?: ICarnetDeBordCahierDeTextesTravailAFaire[];
  ContenuDeCours?: ICarnetDeBordCahierDeTextesContenuDeCours[];
};
export type ICarnetDeBordCahierDeTextesTravailAFaire = {
  Descriptif?: string;
  PourLeString: string;
  PourLe: moment.Moment;
  PieceJointe?: string[];
  SiteInternet?: string[];
};
export type ICarnetDeBordCahierDeTextesContenuDeCours = {
  Titre?: string;
  Descriptif?: string;
  Categorie?: string;
  PieceJointe?: string[];
  SiteInternet?: string[];
};

export type ICarnetDeBordCompetencesItem = {
  type: 'Item';
  Competence?: string;
  Intitule?: string;
  Matiere?: string;
  NiveauDAcquisition?: {
    Genre?: number;
    Libelle?: string;
  };
  Date?: moment.Moment;
  DateString?: string;
};
export type ICarnetDeBordCompetencesEvaluation = Omit<ICarnetDeBordCompetencesItem, 'type'> & {
  type: 'Evaluation';
  Item?: string;
};
export type ICarnetDeBordCompetencesDomaine = Omit<ICarnetDeBordCompetencesItem, 'type'> & { type: 'Domaine' };

export type ICarnetDeBordReleveDeNotesDevoir = {
  Note: string;
  Bareme: string;
  Matiere?: string;
  Date: moment.Moment;
  DateString: string;
};

export type ICarnetDeBordVieScolaireAbsence = {
  type: 'Absence';
  DateDebut: moment.Moment;
  DateDebutString: string;
  DateFin: moment.Moment;
  DateFinString: string;
  EstOuverte: boolean;
  Justifie: boolean;
  Motif?: string;
};
export type ICarnetDeBordVieScolaireRetard = {
  type: 'Retard';
  Date: moment.Moment;
  DateString: string;
  Justifie: boolean;
  Motif?: string;
};
export type ICarnetDeBordVieScolairePassageInfirmerie = {
  type: 'PassageInfirmerie';
  Date: moment.Moment;
  DateString: string;
};
export type ICarnetDeBordVieScolairePunition = {
  type: 'Punition';
  Date: moment.Moment;
  DateString: string;
  Nature?: string;
  Matiere?: string;
  Motif?: string;
  Circonstances?: string;
};
export type ICarnetDeBordVieScolaireSanction = {
  type: 'Sanction';
  Date: moment.Moment;
  DateString: string;
  Nature?: string;
  Motif?: string;
  Circonstances?: string;
  Duree?: number;
};
export type ICarnetDeBordVieScolaireObservation = {
  type: 'Observation';
  Date: moment.Moment;
  DateString: string;
  Demandeur?: string;
  Matiere?: string;
  Observation?: string;
};
