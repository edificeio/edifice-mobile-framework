/**
 * CarnetDeBord Service
 * Controls and interpret API of the feature of Pronote.
 */
import { XMLParser } from 'fast-xml-parser';
import moment from 'moment';

import { IUserSession, getUserSession } from '~/framework/util/session';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

import {
  ICarnetDeBord,
  ICarnetDeBordCahierDeTextes,
  ICarnetDeBordCahierDeTextesContenuDeCours,
  ICarnetDeBordCahierDeTextesTravailAFaire,
  ICarnetDeBordCompetencesDomaine,
  ICarnetDeBordCompetencesEvaluation,
  ICarnetDeBordCompetencesItem,
  ICarnetDeBordReleveDeNotesDevoir,
  ICarnetDeBordVieScolaireAbsence,
  ICarnetDeBordVieScolaireObservation,
  ICarnetDeBordVieScolairePassageInfirmerie,
  ICarnetDeBordVieScolairePunition,
  ICarnetDeBordVieScolaireRetard,
  ICarnetDeBordVieScolaireSanction,
  IPronoteConnectorInfo,
} from '../model/carnetDeBord';

export type ICarnetDeBordBackend = (IPronoteConnectorInfo & {
  xmlResponse: string;
})[];

const parseCompetencesItem = (itemTag, item) => {
  if (itemTag.hasOwnProperty('Date')) {
    (item as ICarnetDeBordCompetencesItem).DateString = itemTag.Date[0]?.['#text'];
    (item as ICarnetDeBordCompetencesItem).Date = moment(itemTag.Date[0]?.['#text']);
  } else if (itemTag.hasOwnProperty('Competence')) {
    (item as ICarnetDeBordCompetencesItem).Competence = itemTag.Competence[0]?.['#text'];
  } else if (itemTag.hasOwnProperty('Intitule')) {
    (item as ICarnetDeBordCompetencesItem).Intitule = itemTag.Intitule[0]?.['#text'];
  } else if (itemTag.hasOwnProperty('Matiere')) {
    (item as ICarnetDeBordCompetencesItem).Matiere = itemTag.Matiere[0]?.['#text'];
  } else if (itemTag.hasOwnProperty('NiveauDAcquisition')) {
    const nda = {};
    for (const ndaTag of itemTag.NiveauDAcquisition) {
      if (ndaTag.hasOwnProperty('Genre')) {
        (nda as ICarnetDeBordCompetencesItem['NiveauDAcquisition']).Genre = ndaTag.Genre[0]?.['#text'];
      } else if (ndaTag.hasOwnProperty('Libelle')) {
        (nda as ICarnetDeBordCompetencesItem['NiveauDAcquisition']).Libelle = ndaTag.Libelle[0]?.['#text'];
      }
    }
    if (
      (nda as Partial<ICarnetDeBordCompetencesItem['NiveauDAcquisition']>).Genre !== undefined &&
      (nda as Partial<ICarnetDeBordCompetencesItem['NiveauDAcquisition']>).Libelle !== undefined
    ) {
      (item as ICarnetDeBordCompetencesItem).NiveauDAcquisition = nda as ICarnetDeBordCompetencesItem['NiveauDAcquisition'];
    }
  }
};

function carnetDeBordAdapterEleve(data: any, connector: IPronoteConnectorInfo): ICarnetDeBord {
  const ret = {
    structureId: connector.structureId,
    address: connector.address,
  };

  for (const tag of data) {
    // CahierDeTextes

    if (tag.hasOwnProperty('PageCahierDeTextes')) {
      const PageCahierDeTextes = {};
      for (const cdtTag of tag.PageCahierDeTextes) {
        if (!(PageCahierDeTextes as Required<ICarnetDeBord>['PageCahierDeTextes'])?.CahierDeTextes)
          (PageCahierDeTextes as Required<ICarnetDeBord>['PageCahierDeTextes']).CahierDeTextes = [];
        if (cdtTag.hasOwnProperty('Titre')) {
          (PageCahierDeTextes as Required<ICarnetDeBord>['PageCahierDeTextes']).Titre = cdtTag.Titre[0]?.['#text'];
        } else if (cdtTag.hasOwnProperty('CahierDeTextes')) {
          const cdt = {};
          for (const cdtItemTag of cdtTag.CahierDeTextes) {
            if (cdtItemTag.hasOwnProperty('Date')) {
              (cdt as ICarnetDeBordCahierDeTextes).DateString = cdtItemTag.Date[0]?.['#text'];
              (cdt as ICarnetDeBordCahierDeTextes).Date = moment(cdtItemTag.Date[0]?.['#text']);
            } else if (cdtItemTag.hasOwnProperty('Matiere')) {
              (cdt as ICarnetDeBordCahierDeTextes).Matiere = cdtItemTag.Matiere[0]?.['#text'];
            } else if (cdtItemTag.hasOwnProperty('ContenuDeCours')) {
              const cdc = {};
              if (!(cdt as ICarnetDeBordCahierDeTextes).ContenuDeCours) {
                (cdt as ICarnetDeBordCahierDeTextes).ContenuDeCours = [];
              }
              for (const cdctag of cdtItemTag.ContenuDeCours) {
                if (cdctag.hasOwnProperty('Titre')) {
                  (cdc as ICarnetDeBordCahierDeTextesContenuDeCours).Titre = cdctag.Titre[0]?.['#text'];
                } else if (cdctag.hasOwnProperty('Categorie')) {
                  (cdc as ICarnetDeBordCahierDeTextesContenuDeCours).Categorie = cdctag.Categorie[0]?.['#text'];
                } else if (cdctag.hasOwnProperty('Descriptif')) {
                  (cdc as ICarnetDeBordCahierDeTextesContenuDeCours).Descriptif = cdctag.Descriptif[0]?.['#text'];
                } else if (cdctag.hasOwnProperty('PieceJointe')) {
                  if (!(cdc as ICarnetDeBordCahierDeTextesContenuDeCours).PieceJointe) {
                    (cdc as ICarnetDeBordCahierDeTextesContenuDeCours).PieceJointe = [];
                  }
                  (cdc as ICarnetDeBordCahierDeTextesContenuDeCours).PieceJointe?.push(cdctag.PieceJointe[0]?.['#text']);
                } else if (cdctag.hasOwnProperty('SiteInternet')) {
                  if (!(cdc as ICarnetDeBordCahierDeTextesContenuDeCours).SiteInternet) {
                    (cdc as ICarnetDeBordCahierDeTextesContenuDeCours).SiteInternet = [];
                  }
                  (cdc as ICarnetDeBordCahierDeTextesContenuDeCours).SiteInternet?.push(cdctag.SiteInternet[0]?.['#text']);
                }
              }
              (cdt as ICarnetDeBordCahierDeTextes).ContenuDeCours?.push(cdc as ICarnetDeBordCahierDeTextesContenuDeCours);
            } else if (cdtItemTag.hasOwnProperty('TravailAFaire')) {
              const taf = {};
              if (!(cdt as ICarnetDeBordCahierDeTextes).TravailAFaire) {
                (cdt as ICarnetDeBordCahierDeTextes).TravailAFaire = [];
              }
              for (const taftag of cdtItemTag.TravailAFaire) {
                if (taftag.hasOwnProperty('PourLe')) {
                  (taf as ICarnetDeBordCahierDeTextesTravailAFaire).PourLeString = taftag.PourLe[0]?.['#text'];
                  (taf as ICarnetDeBordCahierDeTextesTravailAFaire).PourLe = moment(taftag.PourLe[0]?.['#text']);
                } else if (taftag.hasOwnProperty('Descriptif')) {
                  (taf as ICarnetDeBordCahierDeTextesTravailAFaire).Descriptif = taftag.Descriptif[0]?.['#text'];
                } else if (taftag.hasOwnProperty('PieceJointe')) {
                  if (!(taf as ICarnetDeBordCahierDeTextesTravailAFaire).PieceJointe) {
                    (taf as ICarnetDeBordCahierDeTextesTravailAFaire).PieceJointe = [];
                  }
                  (taf as ICarnetDeBordCahierDeTextesTravailAFaire).PieceJointe?.push(taftag.PieceJointe[0]?.['#text']);
                } else if (taftag.hasOwnProperty('SiteInternet')) {
                  if (!(taf as ICarnetDeBordCahierDeTextesTravailAFaire).SiteInternet) {
                    (taf as ICarnetDeBordCahierDeTextesTravailAFaire).SiteInternet = [];
                  }
                  (taf as ICarnetDeBordCahierDeTextesTravailAFaire).SiteInternet?.push(taftag.SiteInternet[0]?.['#text']);
                }
              }
              (cdt as ICarnetDeBordCahierDeTextes).TravailAFaire?.push(taf as ICarnetDeBordCahierDeTextesTravailAFaire);
            }
          }
          (PageCahierDeTextes as Required<ICarnetDeBord>['PageCahierDeTextes']).CahierDeTextes?.push(
            cdt as ICarnetDeBordCahierDeTextes,
          );
        }
      }
      (ret as ICarnetDeBord).PageCahierDeTextes = PageCahierDeTextes as ICarnetDeBord['PageCahierDeTextes'];
    }

    // Competences
    else if (tag.hasOwnProperty('PageCompetences')) {
      const PageCompetences = {};
      for (const pageTag of tag.PageCompetences) {
        if (!(PageCompetences as Required<ICarnetDeBord>['PageCompetences']).Competences)
          (PageCompetences as Required<ICarnetDeBord>['PageCompetences']).Competences = [];
        if (pageTag.hasOwnProperty('Titre')) {
          (PageCompetences as Required<ICarnetDeBord>['PageCompetences']).Titre = pageTag.Titre[0]?.['#text'];
        } else if (pageTag.hasOwnProperty('Item')) {
          const item = { type: 'Item' };
          for (const itemTag of pageTag.Item) {
            parseCompetencesItem(itemTag, item);
          }
          (PageCompetences as Required<ICarnetDeBord>['PageCompetences']).Competences?.push(item as ICarnetDeBordCompetencesItem);
        } else if (pageTag.hasOwnProperty('Domaine')) {
          const item = { type: 'Domaine' };
          for (const itemTag of pageTag.Domaine) {
            parseCompetencesItem(itemTag, item);
          }
          (PageCompetences as Required<ICarnetDeBord>['PageCompetences']).Competences?.push(
            item as ICarnetDeBordCompetencesDomaine,
          );
        } else if (pageTag.hasOwnProperty('Evaluation')) {
          const item = { type: 'Evaluation' };
          for (const itemTag of pageTag.Evaluation) {
            parseCompetencesItem(itemTag, item);
            if (itemTag.hasOwnProperty('Item')) {
              (item as ICarnetDeBordCompetencesEvaluation).Item = itemTag.Item[0]?.['#text'];
            }
          }
          (PageCompetences as Required<ICarnetDeBord>['PageCompetences']).Competences?.push(
            item as ICarnetDeBordCompetencesEvaluation,
          );
        }

        (ret as ICarnetDeBord).PageCompetences = PageCompetences as ICarnetDeBord['PageCompetences'];
      }
    }

    // ReleveDeNotes
    else if (tag.hasOwnProperty('PageReleveDeNotes')) {
      const PageReleveDeNotes = {};
      for (const pageTag of tag.PageReleveDeNotes) {
        if (pageTag.hasOwnProperty('Titre')) {
          (PageReleveDeNotes as Required<ICarnetDeBord>['PageReleveDeNotes']).Titre = pageTag.Titre[0]?.['#text'];
        } else if (pageTag.hasOwnProperty('Message')) {
          (PageReleveDeNotes as Required<ICarnetDeBord>['PageReleveDeNotes']).Message = pageTag.Message[0]?.['#text'];
        } else if (pageTag.hasOwnProperty('Devoir')) {
          if (!(PageReleveDeNotes as Required<ICarnetDeBord>['PageReleveDeNotes']).Devoir)
            (PageReleveDeNotes as Required<ICarnetDeBord>['PageReleveDeNotes']).Devoir = [];
          const devoir = {};
          for (const dTag of pageTag.Devoir) {
            if (dTag.hasOwnProperty('Note')) {
              (devoir as ICarnetDeBordReleveDeNotesDevoir).Note = dTag.Note[0]?.['#text'];
            } else if (dTag.hasOwnProperty('Bareme')) {
              (devoir as ICarnetDeBordReleveDeNotesDevoir).Bareme = dTag.Bareme[0]?.['#text'];
            } else if (dTag.hasOwnProperty('Matiere')) {
              (devoir as ICarnetDeBordReleveDeNotesDevoir).Matiere = dTag.Matiere[0]?.['#text'];
            } else if (dTag.hasOwnProperty('Date')) {
              (devoir as ICarnetDeBordReleveDeNotesDevoir).DateString = dTag.Date[0]?.['#text'];
              (devoir as ICarnetDeBordReleveDeNotesDevoir).Date = moment(dTag.Date[0]?.['#text']);
            }
          }
          (PageReleveDeNotes as Required<ICarnetDeBord>['PageReleveDeNotes']).Devoir?.push(
            devoir as ICarnetDeBordReleveDeNotesDevoir,
          );
        }
      }
      (ret as ICarnetDeBord).PageReleveDeNotes = PageReleveDeNotes as ICarnetDeBord['PageReleveDeNotes'];
    }

    // VieScolaire
    else if (tag.hasOwnProperty('PageVieScolaire')) {
      const PageVieScolaire = {};
      if (!(PageVieScolaire as Required<ICarnetDeBord>['PageVieScolaire']).VieScolaire)
        (PageVieScolaire as Required<ICarnetDeBord>['PageVieScolaire']).VieScolaire = [];
      for (const pageTag of tag.PageVieScolaire) {
        if (pageTag.hasOwnProperty('Titre')) {
          (PageVieScolaire as Required<ICarnetDeBord>['PageVieScolaire']).Titre = pageTag.Titre[0]?.['#text'];
        } else if (pageTag.hasOwnProperty('Absence')) {
          const item = { type: 'Absence' };
          for (const iTag of pageTag.Absence) {
            if (iTag.hasOwnProperty('DateDebut')) {
              (item as ICarnetDeBordVieScolaireAbsence).DateDebutString = iTag.DateDebut[0]?.['#text'];
              (item as ICarnetDeBordVieScolaireAbsence).DateDebut = moment(iTag.DateDebut[0]?.['#text']);
            } else if (iTag.hasOwnProperty('DateFin')) {
              (item as ICarnetDeBordVieScolaireAbsence).DateFinString = iTag.DateFin[0]?.['#text'];
              (item as ICarnetDeBordVieScolaireAbsence).DateFin = moment(iTag.DateFin[0]?.['#text']);
            } else if (iTag.hasOwnProperty('EstOuverte')) {
              (item as ICarnetDeBordVieScolaireAbsence).EstOuverte = iTag.EstOuverte[0]?.['#text'];
            } else if (iTag.hasOwnProperty('Justifie')) {
              (item as ICarnetDeBordVieScolaireAbsence).Justifie = iTag.Justifie[0]?.['#text'];
            } else if (iTag.hasOwnProperty('Motif')) {
              (item as ICarnetDeBordVieScolaireAbsence).Motif = iTag.Motif[0]?.['#text'];
            }
          }
          (PageVieScolaire as Required<ICarnetDeBord>['PageVieScolaire']).VieScolaire?.push(
            item as ICarnetDeBordVieScolaireAbsence,
          );
        } else if (pageTag.hasOwnProperty('Retard')) {
          const item = { type: 'Retard' };
          for (const iTag of pageTag.Retard) {
            if (iTag.hasOwnProperty('Date')) {
              (item as ICarnetDeBordVieScolaireRetard).DateString = iTag.Date[0]?.['#text'];
              (item as ICarnetDeBordVieScolaireRetard).Date = moment(iTag.Date[0]?.['#text']);
            } else if (iTag.hasOwnProperty('Justifie')) {
              (item as ICarnetDeBordVieScolaireRetard).Justifie = iTag.Justifie[0]?.['#text'];
            } else if (iTag.hasOwnProperty('Motif')) {
              (item as ICarnetDeBordVieScolaireRetard).Motif = iTag.Motif[0]?.['#text'];
            }
          }
          (PageVieScolaire as Required<ICarnetDeBord>['PageVieScolaire']).VieScolaire?.push(item as ICarnetDeBordVieScolaireRetard);
        } else if (pageTag.hasOwnProperty('PassageInfirmerie')) {
          const item = { type: 'PassageInfirmerie' };
          for (const iTag of pageTag.PassageInfirmerie) {
            if (iTag.hasOwnProperty('Date')) {
              (item as ICarnetDeBordVieScolairePassageInfirmerie).DateString = iTag.Date[0]?.['#text'];
              (item as ICarnetDeBordVieScolairePassageInfirmerie).Date = moment(iTag.Date[0]?.['#text']);
            }
          }
          (PageVieScolaire as Required<ICarnetDeBord>['PageVieScolaire']).VieScolaire?.push(
            item as ICarnetDeBordVieScolairePassageInfirmerie,
          );
        } else if (pageTag.hasOwnProperty('Punition')) {
          const item = { type: 'Punition' };
          for (const iTag of pageTag.Punition) {
            if (iTag.hasOwnProperty('Date')) {
              (item as ICarnetDeBordVieScolairePunition).DateString = iTag.Date[0]?.['#text'];
              (item as ICarnetDeBordVieScolairePunition).Date = moment(iTag.Date[0]?.['#text']);
            } else if (iTag.hasOwnProperty('Nature')) {
              (item as ICarnetDeBordVieScolairePunition).Nature = iTag.Nature[0]?.['#text'];
            } else if (iTag.hasOwnProperty('Matiere')) {
              (item as ICarnetDeBordVieScolairePunition).Matiere = iTag.Matiere[0]?.['#text'];
            } else if (iTag.hasOwnProperty('Motif')) {
              (item as ICarnetDeBordVieScolairePunition).Motif = iTag.Motif[0]?.['#text'];
            } else if (iTag.hasOwnProperty('Circonstances')) {
              (item as ICarnetDeBordVieScolairePunition).Circonstances = iTag.Circonstances[0]?.['#text'];
            }
          }
          (PageVieScolaire as Required<ICarnetDeBord>['PageVieScolaire']).VieScolaire?.push(
            item as ICarnetDeBordVieScolairePunition,
          );
        } else if (pageTag.hasOwnProperty('Sanction')) {
          const item = { type: 'Sanction' };
          for (const iTag of pageTag.Sanction) {
            if (iTag.hasOwnProperty('Date')) {
              (item as ICarnetDeBordVieScolaireSanction).DateString = iTag.Date[0]?.['#text'];
              (item as ICarnetDeBordVieScolaireSanction).Date = moment(iTag.Date[0]?.['#text']);
            } else if (iTag.hasOwnProperty('Nature')) {
              (item as ICarnetDeBordVieScolaireSanction).Nature = iTag.Nature[0]?.['#text'];
            } else if (iTag.hasOwnProperty('Motif')) {
              (item as ICarnetDeBordVieScolaireSanction).Motif = iTag.Motif[0]?.['#text'];
            } else if (iTag.hasOwnProperty('Circonstances')) {
              (item as ICarnetDeBordVieScolaireSanction).Circonstances = iTag.Circonstances[0]?.['#text'];
            } else if (iTag.hasOwnProperty('Duree')) {
              (item as ICarnetDeBordVieScolaireSanction).Duree = iTag.Duree[0]?.['#text'];
            }
          }
          (PageVieScolaire as Required<ICarnetDeBord>['PageVieScolaire']).VieScolaire?.push(
            item as ICarnetDeBordVieScolaireSanction,
          );
        } else if (pageTag.hasOwnProperty('Observation')) {
          const item = { type: 'Observation' };
          for (const iTag of pageTag.Observation) {
            if (iTag.hasOwnProperty('Date')) {
              (item as ICarnetDeBordVieScolaireObservation).DateString = iTag.Date[0]?.['#text'];
              (item as ICarnetDeBordVieScolaireObservation).Date = moment(iTag.Date[0]?.['#text']);
            } else if (iTag.hasOwnProperty('Demandeur')) {
              (item as ICarnetDeBordVieScolaireObservation).Demandeur = iTag.Demandeur[0]?.['#text'];
            } else if (iTag.hasOwnProperty('Matiere')) {
              (item as ICarnetDeBordVieScolaireObservation).Matiere = iTag.Matiere[0]?.['#text'];
            } else if (iTag.hasOwnProperty('Observation')) {
              (item as ICarnetDeBordVieScolaireObservation).Observation = iTag.Observation[0]?.['#text'];
            }
          }
          (PageVieScolaire as Required<ICarnetDeBord>['PageVieScolaire']).VieScolaire?.push(
            item as ICarnetDeBordVieScolaireObservation,
          );
        }
      }
      (ret as ICarnetDeBord).PageVieScolaire = PageVieScolaire as ICarnetDeBord['PageVieScolaire'];
    } else if (tag.hasOwnProperty('PagePronote')) {
      if (!(ret as ICarnetDeBord).PagePronote) (ret as ICarnetDeBord).PagePronote = {};
      if (tag[':@']['@_nom'] && tag[':@']['@_page']) {
        (ret as ICarnetDeBord).PagePronote![tag[':@']['@_nom']] = tag[':@']['@_page'];
      }
    }
  }

  return ret as ICarnetDeBord;
}

function carnetDeBordAdapterParent(
  eleve: any,
  connector: IPronoteConnectorInfo,
  children: IChildrenInfo,
): ICarnetDeBord | undefined {
  const found = {} as { firstName?: string; lastName?: string; idPronote?: string };
  for (const tag of eleve) {
    if (tag.hasOwnProperty('Prenom')) {
      (found as Required<typeof found>).firstName = tag.Prenom[0]?.['#text'];
    } else if (tag.hasOwnProperty('Nom')) {
      (found as Required<typeof found>).lastName = tag.Nom[0]?.['#text'];
    } else if (tag.hasOwnProperty('IdentifiantPronote')) {
      (found as Required<typeof found>).idPronote = tag.IdentifiantPronote[0]?.['#text'];
    }
  }
  const correspondsTo = children.find(c => c.firstName === found.firstName && c.lastName === found.lastName);
  if (!correspondsTo) {
    console.warn(`children ${found.firstName} ${found.lastName} not found`);
    return undefined;
  }
  const ret = {
    ...carnetDeBordAdapterEleve(eleve, connector),
    displayName: correspondsTo.displayName,
    firstName: correspondsTo.firstName,
    lastName: correspondsTo.lastName,
    id: correspondsTo.id,
    idPronote: (found as Required<typeof found>).idPronote,
  };
  return ret;
}

function carnetDeBordAdapter(data: ICarnetDeBordBackend, children: IChildrenInfo): ICarnetDeBord[] {
  const retAsObject: { [id: string]: ICarnetDeBord } = {};
  children.forEach(child => {
    retAsObject[child.id] = {
      ...child,
    };
  });
  data.forEach(cdb => {
    const parser = new XMLParser({
      allowBooleanAttributes: true,
      ignoreDeclaration: true,
      preserveOrder: true,
      ignoreAttributes: false,
    });
    // console.log('xmlToParse', cdb.xmlResponse);
    cdb.xmlResponse = parser.parse(cdb.xmlResponse);

    const root = cdb.xmlResponse[0] as any; // `any` is used to represent the server raw xml in json.
    if (root.hasOwnProperty('Parent')) {
      for (const tag of root.Parent) {
        if (tag.hasOwnProperty('Eleve')) {
          const parsedEleve = carnetDeBordAdapterParent(tag.Eleve, cdb, children);
          if (parsedEleve) retAsObject[parsedEleve.id] = parsedEleve;
        }
      }
    } else if (root.hasOwnProperty('Eleve')) {
      const parsedEleve = carnetDeBordAdapterEleve(root.Eleve, cdb);
      const session = getUserSession();
      if (parsedEleve)
        retAsObject[''] = {
          ...parsedEleve,
          displayName: session.user.displayName,
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          id: session.user.id,
          idPronote: session.user.id, // Yes it's not really the Pronote ID but in this case we have to mock it.
        };
    } else {
      throw new Error(`Malformed xml. Do not contain either Parent or Eleve tag.`);
    }
  });
  return Object.values(retAsObject);
}

export type IChildrenInfo = {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
}[];

export default {
  get: async (session: IUserSession, children: IChildrenInfo) => {
    const api = `/sso/pronote`;
    const data = (await fetchJSONWithCache(api)) as ICarnetDeBordBackend;
    return carnetDeBordAdapter(data, children);
  },
};
