import moment from 'moment';


export type IPronoteConnectorInfo = {
  structureId: string;
  address: string;
  idPronote: string;
};

export type IUserBasic = {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
};

export type ICarnetDeBord = IUserBasic &
  IPronoteConnectorInfo & {
    PageCahierDeTextes: {
      Titre: string;
      CahierDeTextes?: ICarnetDeBord__CahierDeTextes[];
    };
    PageCompetences: {
      Titre: string;
      Competences?: Array<
        ICarnetDeBord__Competences_Evaluation | ICarnetDeBord__Competences_Item | ICarnetDeBord__Competences_Domaine
      >;
    };
    PageReleveDeNotes: {
      Titre: string;
      Message?: string;
      Devoir?: ICarnetDeBord__ReleveDeNotes_Devoir[];
    };
    PageVieScolaire: {
      Titre: string;
      VieScolaire?: Array<
        | ICarnetDeBord__VieScolaire_Absence
        | ICarnetDeBord__VieScolaire_Retard
        | ICarnetDeBord__VieScolaire_PassageInfirmerie
        | ICarnetDeBord__VieScolaire_Punition
        | ICarnetDeBord__VieScolaire_Sanction
        | ICarnetDeBord__VieScolaire_Observation
      >;
    };
  };

export type ICarnetDeBord__CahierDeTextes = {
  Date: moment.Moment;
  DateString: string;
  Matiere?: string;
  TravailAFaire?: ICarnetDeBord__CahierDeTextes_TravailAFaire[];
  ContenuDeCours?: ICarnetDeBord__CahierDeTextes_ContenuDeCours[];
};
export type ICarnetDeBord__CahierDeTextes_TravailAFaire = {
  Descriptif?: string;
  PourLeString: string;
  PourLe: moment.Moment;
  PieceJointe?: string[];
  SiteInternet?: string[];
};
export type ICarnetDeBord__CahierDeTextes_ContenuDeCours = {
  Titre?: string;
  Descriptif?: string;
  Categorie?: string;
  PieceJointe?: string[];
  SiteInternet?: string[];
};

export type ICarnetDeBord__Competences_Item = {
  type: 'Item';
  Competence?: string;
  Intitule?: string;
  Matiere?: string;
  NiveauDAcquisition: {
    Genre: number;
    Libelle: string;
  };
  Date: moment.Moment;
  DateString: string;
};
export type ICarnetDeBord__Competences_Evaluation = Omit<ICarnetDeBord__Competences_Item, 'type'> & {
  type: 'Evaluation';
  Item?: string;
};
export type ICarnetDeBord__Competences_Domaine = Omit<ICarnetDeBord__Competences_Item, 'type'> & { type: 'Domaine' };

export type ICarnetDeBord__ReleveDeNotes_Devoir = {
  Note: string;
  Bareme: string;
  Matiere?: string;
  Date: moment.Moment;
  DateString: string;
};

export type ICarnetDeBord__VieScolaire_Absence = {
  type: 'Absence';
  DateDebut: moment.Moment;
  DateDebutString: string;
  DateFin: moment.Moment;
  DateFinString: string;
  EstOuverte: boolean;
  Justifie: boolean;
  Motif?: string;
};
export type ICarnetDeBord__VieScolaire_Retard = {
  type: 'Retard';
  Date: moment.Moment;
  DateString: string;
  Justifie: boolean;
  Motif?: string;
};
export type ICarnetDeBord__VieScolaire_PassageInfirmerie = {
  type: 'PassageInfirmerie';
  Date: moment.Moment;
  DateString: string;
};
export type ICarnetDeBord__VieScolaire_Punition = {
  type: 'Punition';
  Date: moment.Moment;
  DateString: string;
  Nature?: string;
  Matiere?: string;
  Motif?: string;
  Circonstances?: string;
};
export type ICarnetDeBord__VieScolaire_Sanction = {
  type: 'Sanction';
  Date: moment.Moment;
  DateString: string;
  Nature?: string;
  Motif?: string;
  Circonstances?: string;
  Duree?: number;
};
export type ICarnetDeBord__VieScolaire_Observation = {
  type: 'Observation';
  Date: moment.Moment;
  DateString: string;
  Demandeur?: string;
  Matiere?: string;
  Observation?: string;
};