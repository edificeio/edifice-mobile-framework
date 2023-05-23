import moment from 'moment';

import { I18n } from '~/app/i18n';

export enum CarnetDeBordSection {
  CAHIER_DE_TEXTES = 1, // No falsy values in this
  NOTES,
  COMPETENCES,
  VIE_SCOLAIRE,
}

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
  Partial<IPronoteConnectorInfo> & {
    PageCahierDeTextes?: {
      Titre: string;
      // CahierDeTextes?: ICarnetDeBordCahierDeTextes[]; // Not used in our front.
      TravailAFairePast: ICarnetDeBordCahierDeTextesTravailAFaire[];
      TravailAFaireFuture: ICarnetDeBordCahierDeTextesTravailAFaire[];
    };
    PageCompetences?: {
      Titre: string;
      CompetencesPast: (ICarnetDeBordCompetencesEvaluation | ICarnetDeBordCompetencesItem | ICarnetDeBordCompetencesDomaine)[];
      CompetencesFuture: (ICarnetDeBordCompetencesEvaluation | ICarnetDeBordCompetencesItem | ICarnetDeBordCompetencesDomaine)[];
    };
    PageReleveDeNotes?: {
      Titre: string;
      Message?: string;
      DevoirsPast: ICarnetDeBordReleveDeNotesDevoir[];
      DevoirsFuture: ICarnetDeBordReleveDeNotesDevoir[];
    };
    PageVieScolaire?: {
      Titre: string;
      VieScolairePast?: (
        | ICarnetDeBordVieScolaireAbsence
        | ICarnetDeBordVieScolaireRetard
        | ICarnetDeBordVieScolairePassageInfirmerie
        | ICarnetDeBordVieScolairePunition
        | ICarnetDeBordVieScolaireSanction
        | ICarnetDeBordVieScolaireObservation
      )[];
      VieScolaireFuture?: (
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
  Date?: moment.Moment;
  DateString?: string;
  Matiere?: string;
  TravailAFaire?: ICarnetDeBordCahierDeTextesTravailAFaire[];
  ContenuDeCours?: ICarnetDeBordCahierDeTextesContenuDeCours[];
};
export type ICarnetDeBordCahierDeTextesTravailAFaire = {
  Descriptif?: string;
  PourLeString?: string;
  PourLe?: moment.Moment;
  PieceJointe?: string[];
  SiteInternet?: string[];
} & Pick<ICarnetDeBordCahierDeTextes, 'Matiere'>;
export type ICarnetDeBordCahierDeTextesContenuDeCours = {
  Titre?: string;
  Descriptif?: string;
  Categorie?: string;
  PieceJointe?: string[];
  SiteInternet?: string[];
} & Pick<ICarnetDeBordCahierDeTextes, 'Matiere'>;

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
  Bareme?: string;
  Matiere?: string;
  Date?: moment.Moment;
  DateString?: string;
};
const carnetDeBordReleveDeNotesDevoirSpecialValueI18n = {
  abs: 'pronote.carnetDeBord.releveDeNotes.value.abs',
  disp: 'pronote.carnetDeBord.releveDeNotes.value.disp',
  'n.not': 'pronote.carnetDeBord.releveDeNotes.value.nnot',
  inap: 'pronote.carnetDeBord.releveDeNotes.value.inap',
  'n.rdu': 'pronote.carnetDeBord.releveDeNotes.value.nrdu',
};
export function formatCarnetDeBordReleveDeNotesDevoirNoteBareme(note?: string | number, bareme?: string) {
  if (note === undefined) return I18n.get('pronote.carnetDeBord.noInfo');
  const noteLowerCase = note.toString().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(carnetDeBordReleveDeNotesDevoirSpecialValueI18n, noteLowerCase)) {
    return I18n.get(carnetDeBordReleveDeNotesDevoirSpecialValueI18n[noteLowerCase]);
  } else
    return bareme
      ? I18n.get('pronote.carnetDeBord.releveDeNotes.note', {
          note,
          bareme,
        })
      : note.toString();
}

export type ICarnetDeBordVieScolaireAbsence = {
  type: 'Absence';
  DateDebut?: moment.Moment;
  DateDebutString?: string;
  DateFin?: moment.Moment;
  DateFinString?: string;
  EstOuverte?: boolean;
  Justifie?: boolean;
  Motif?: string;
};
export type ICarnetDeBordVieScolaireRetard = {
  type: 'Retard';
  Date?: moment.Moment;
  DateString?: string;
  Justifie?: boolean;
  Motif?: string;
};
export type ICarnetDeBordVieScolairePassageInfirmerie = {
  type: 'PassageInfirmerie';
  Date?: moment.Moment;
  DateString?: string;
};
export type ICarnetDeBordVieScolairePunition = {
  type: 'Punition';
  Date?: moment.Moment;
  DateString?: string;
  Nature?: string;
  Matiere?: string;
  Motif?: string;
  Circonstances?: string;
};
export type ICarnetDeBordVieScolaireSanction = {
  type: 'Sanction';
  Date?: moment.Moment;
  DateString?: string;
  Nature?: string;
  Motif?: string;
  Circonstances?: string;
  Duree?: number;
};
export type ICarnetDeBordVieScolaireObservation = {
  type: 'Observation';
  Date?: moment.Moment;
  DateString?: string;
  Demandeur?: string;
  Matiere?: string;
  Observation?: string;
};

export function sortCarnetDeBordItems<T extends { Date?: moment.Moment; DateDebut?: moment.Moment; PourLe?: moment.Moment }>(
  items: T[],
  reverse?: boolean,
) {
  return items.sort((a, b) => {
    const aDate = a.Date ?? a.DateDebut ?? a.PourLe;
    const bDate = b.Date ?? b.DateDebut ?? b.PourLe;
    if (aDate === undefined) return reverse ? -1 : 1;
    if (bDate === undefined) return reverse ? 1 : -1;
    return reverse ? bDate.diff(aDate) : aDate.diff(bDate);
  });
}

export function getSummaryItem<T>(itemsPast?: T[], itemsFuture?: T[]) {
  return itemsFuture !== undefined && itemsFuture.length > 0
    ? itemsFuture[0]
    : itemsPast !== undefined && itemsPast.length > 0
    ? itemsPast[itemsPast.length - 1]
    : undefined;
}

const carnetDeBordVieScolaireTypeI18n = {
  Absence: 'pronote.carnetDeBord.vieScolaire.type.Absence',
  Retard: 'pronote.carnetDeBord.vieScolaire.type.Retard',
  PassageInfirmerie: 'pronote.carnetDeBord.vieScolaire.type.PassageInfirmerie',
  Punition: 'pronote.carnetDeBord.vieScolaire.type.Punition',
  Sanction: 'pronote.carnetDeBord.vieScolaire.type.Sanction',
  Observation: 'pronote.carnetDeBord.vieScolaire.type.Observation',
};

export function formatCarnetDeBordVieScolaireType(type?: string) {
  return type && Object.prototype.hasOwnProperty.call(carnetDeBordVieScolaireTypeI18n, type)
    ? I18n.get(carnetDeBordVieScolaireTypeI18n[type])
    : I18n.get('pronote.carnetDeBord.noInfo');
}
const carnetDeBordCompetencesValueI18n = {
  1: 'pronote.carnetDeBord.competences.value.1',
  2: 'pronote.carnetDeBord.competences.value.2',
  3: 'pronote.carnetDeBord.competences.value.3',
  4: 'pronote.carnetDeBord.competences.value.4',
  5: 'pronote.carnetDeBord.competences.value.5',
  6: 'pronote.carnetDeBord.competences.value.6',
  7: 'pronote.carnetDeBord.competences.value.7',
  8: 'pronote.carnetDeBord.competences.value.8',
};
export function formatCarnetDeBordCompetencesValue(value?: number) {
  return value && Object.prototype.hasOwnProperty.call(carnetDeBordCompetencesValueI18n, value)
    ? I18n.get(carnetDeBordCompetencesValueI18n[value])
    : I18n.get('pronote.carnetDeBord.noInfo');
}

export class PronoteCdbInitError extends Error {}
