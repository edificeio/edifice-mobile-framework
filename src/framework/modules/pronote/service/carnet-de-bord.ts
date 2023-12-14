/**
 * CarnetDeBord Service
 * Controls and interpret API of the feature of Pronote.
 */
import CookieManager from '@react-native-cookies/cookies';
import { XMLParser } from 'fast-xml-parser';
import moment from 'moment';

import { AuthLoggedAccount, UserChildrenFlattened } from '~/framework/modules/auth/model';
import { assertSession } from '~/framework/modules/auth/reducer';
import {
  ICarnetDeBord,
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
  PronoteCdbInitError,
  sortCarnetDeBordItems,
} from '~/framework/modules/pronote/model/carnet-de-bord';
import { IEntcoreApp } from '~/framework/util/moduleTool';
import { fetchWithCache } from '~/infra/fetchWithCache';

import redirect from './redirect';

export type ICarnetDeBordBackend = (IPronoteConnectorInfo & {
  xmlResponse: string;
})[];

const parseCompetencesItem = (itemTag, item) => {
  if (Object.prototype.hasOwnProperty.call(itemTag, 'Date')) {
    (item as ICarnetDeBordCompetencesItem).DateString = itemTag.Date[0]?.['#text'].toString();
    (item as ICarnetDeBordCompetencesItem).Date = (item as ICarnetDeBordCompetencesItem).DateString
      ? moment(itemTag.Date[0]?.['#text'].toString())
      : undefined;
  } else if (Object.prototype.hasOwnProperty.call(itemTag, 'Competence')) {
    (item as ICarnetDeBordCompetencesItem).Competence = itemTag.Competence[0]?.['#text'];
  } else if (Object.prototype.hasOwnProperty.call(itemTag, 'Intitule')) {
    (item as ICarnetDeBordCompetencesItem).Intitule = itemTag.Intitule[0]?.['#text'];
  } else if (Object.prototype.hasOwnProperty.call(itemTag, 'Matiere')) {
    (item as ICarnetDeBordCompetencesItem).Matiere = itemTag.Matiere[0]?.['#text'];
  } else if (Object.prototype.hasOwnProperty.call(itemTag, 'NiveauDAcquisition')) {
    const nda = {};
    for (const ndaTag of itemTag.NiveauDAcquisition) {
      if (Object.prototype.hasOwnProperty.call(ndaTag, 'Genre')) {
        (nda as ICarnetDeBordCompetencesItem['NiveauDAcquisition'])!.Genre = ndaTag.Genre[0]?.['#text'];
      } else if (Object.prototype.hasOwnProperty.call(ndaTag, 'Libelle')) {
        (nda as ICarnetDeBordCompetencesItem['NiveauDAcquisition'])!.Libelle = ndaTag.Libelle[0]?.['#text'];
      }
    }
    if (
      (nda as Partial<ICarnetDeBordCompetencesItem['NiveauDAcquisition']>)!.Genre !== undefined &&
      (nda as Partial<ICarnetDeBordCompetencesItem['NiveauDAcquisition']>)!.Libelle !== undefined
    ) {
      (item as ICarnetDeBordCompetencesItem).NiveauDAcquisition = nda as ICarnetDeBordCompetencesItem['NiveauDAcquisition'];
    }
  }
};

function carnetDeBordAdapterEleve(data: any, connector: IPronoteConnectorInfo): ICarnetDeBord {
  const now = moment();
  const ret = {
    structureId: connector.structureId,
    address: connector.address,
  };

  for (const tag of data) {
    // CahierDeTextes

    if (Object.prototype.hasOwnProperty.call(tag, 'PageCahierDeTextes')) {
      const PageCahierDeTextes: Partial<ICarnetDeBord['PageCahierDeTextes']> = {};
      if (!PageCahierDeTextes?.TravailAFairePast) PageCahierDeTextes.TravailAFairePast = [];
      if (!PageCahierDeTextes?.TravailAFaireFuture) PageCahierDeTextes.TravailAFaireFuture = [];
      for (const cdtTag of tag.PageCahierDeTextes) {
        if (Object.prototype.hasOwnProperty.call(cdtTag, 'Titre')) {
          PageCahierDeTextes.Titre = cdtTag.Titre[0]?.['#text'];
        } else if (Object.prototype.hasOwnProperty.call(cdtTag, 'CahierDeTextes')) {
          let matiere: ICarnetDeBordCahierDeTextesTravailAFaire['Matiere'];
          for (const cdtItemTag of cdtTag.CahierDeTextes) {
            if (Object.prototype.hasOwnProperty.call(cdtItemTag, 'Matiere')) {
              matiere = cdtItemTag.Matiere[0]?.['#text'];
            } else if (Object.prototype.hasOwnProperty.call(cdtItemTag, 'TravailAFaire')) {
              const taf: Partial<ICarnetDeBordCahierDeTextesTravailAFaire> = {};
              for (const taftag of cdtItemTag.TravailAFaire) {
                if (Object.prototype.hasOwnProperty.call(taftag, 'PourLe')) {
                  taf.PourLeString = taftag.PourLe[0]?.['#text'].toString();
                  taf.PourLe = taf.PourLeString ? moment(taftag.PourLe[0]?.['#text'].toString()) : undefined;
                } else if (Object.prototype.hasOwnProperty.call(taftag, 'Descriptif')) {
                  taf.Descriptif = taftag.Descriptif[0]?.['#text'];
                } else if (Object.prototype.hasOwnProperty.call(taftag, 'PieceJointe')) {
                  if (!taf.PieceJointe) {
                    taf.PieceJointe = [];
                  }
                  taf.PieceJointe?.push(taftag.PieceJointe[0]?.['#text']);
                } else if (Object.prototype.hasOwnProperty.call(taftag, 'SiteInternet')) {
                  if (!taf.SiteInternet) {
                    taf.SiteInternet = [];
                  }
                  taf.SiteInternet?.push(taftag.SiteInternet[0]?.['#text']);
                }
                taf.Matiere = matiere;
              }
              if (taf.PourLe && taf.PourLe.diff(now) < 0) {
                PageCahierDeTextes.TravailAFairePast.push(taf);
              } else {
                PageCahierDeTextes.TravailAFaireFuture.push(taf);
              }
            }
          }
        }
      }

      PageCahierDeTextes!.TravailAFairePast = sortCarnetDeBordItems(PageCahierDeTextes!.TravailAFairePast!);
      PageCahierDeTextes!.TravailAFaireFuture = sortCarnetDeBordItems(PageCahierDeTextes!.TravailAFaireFuture!);

      (ret as ICarnetDeBord).PageCahierDeTextes = PageCahierDeTextes as ICarnetDeBord['PageCahierDeTextes'];
    }

    // Competences
    else if (Object.prototype.hasOwnProperty.call(tag, 'PageCompetences')) {
      const PageCompetences: Partial<ICarnetDeBord['PageCompetences']> = {};
      if (!PageCompetences.CompetencesPast) PageCompetences.CompetencesPast = [];
      if (!PageCompetences.CompetencesFuture) PageCompetences.CompetencesFuture = [];
      for (const pageTag of tag.PageCompetences) {
        if (Object.prototype.hasOwnProperty.call(pageTag, 'Titre')) {
          PageCompetences.Titre = pageTag.Titre[0]?.['#text'];
        } else if (Object.prototype.hasOwnProperty.call(pageTag, 'Item')) {
          const item: Partial<ICarnetDeBordCompetencesItem> = { type: 'Item' };
          for (const itemTag of pageTag.Item) {
            parseCompetencesItem(itemTag, item);
          }
          if (item.Date && item.Date.diff(now) < 0) {
            PageCompetences.CompetencesPast?.push(item as ICarnetDeBordCompetencesItem);
          } else {
            PageCompetences.CompetencesFuture?.push(item as ICarnetDeBordCompetencesItem);
          }
        } else if (Object.prototype.hasOwnProperty.call(pageTag, 'Domaine')) {
          const item: Partial<ICarnetDeBordCompetencesDomaine> = { type: 'Domaine' };
          for (const itemTag of pageTag.Domaine) {
            parseCompetencesItem(itemTag, item);
          }
          if (item.Date && item.Date.diff(now) < 0) {
            PageCompetences.CompetencesPast?.push(item as ICarnetDeBordCompetencesDomaine);
          } else {
            PageCompetences.CompetencesFuture?.push(item as ICarnetDeBordCompetencesDomaine);
          }
        } else if (Object.prototype.hasOwnProperty.call(pageTag, 'Evaluation')) {
          const item: Partial<ICarnetDeBordCompetencesEvaluation> = { type: 'Evaluation' };
          for (const itemTag of pageTag.Evaluation) {
            parseCompetencesItem(itemTag, item);
            if (Object.prototype.hasOwnProperty.call(itemTag, 'Item')) {
              item.Item = itemTag.Item[0]?.['#text'];
            }
          }
          if (item.Date && item.Date.diff(now) < 0) {
            PageCompetences.CompetencesPast?.push(item as ICarnetDeBordCompetencesEvaluation);
          } else {
            PageCompetences.CompetencesFuture?.push(item as ICarnetDeBordCompetencesEvaluation);
          }
        }

        PageCompetences!.CompetencesPast = sortCarnetDeBordItems(PageCompetences!.CompetencesPast!);
        PageCompetences!.CompetencesFuture = sortCarnetDeBordItems(PageCompetences!.CompetencesFuture!);
        (ret as ICarnetDeBord).PageCompetences = PageCompetences as ICarnetDeBord['PageCompetences'];
      }
    }

    // ReleveDeNotes
    else if (Object.prototype.hasOwnProperty.call(tag, 'PageReleveDeNotes')) {
      const PageReleveDeNotes: Partial<ICarnetDeBord['PageReleveDeNotes']> = {};
      if (!PageReleveDeNotes.DevoirsPast) PageReleveDeNotes.DevoirsPast = [];
      if (!PageReleveDeNotes.DevoirsFuture) PageReleveDeNotes.DevoirsFuture = [];
      for (const pageTag of tag.PageReleveDeNotes) {
        if (Object.prototype.hasOwnProperty.call(pageTag, 'Titre')) {
          PageReleveDeNotes.Titre = pageTag.Titre[0]?.['#text'];
        } else if (Object.prototype.hasOwnProperty.call(pageTag, 'Message')) {
          PageReleveDeNotes.Message = pageTag.Message[0]?.['#text'];
        } else if (Object.prototype.hasOwnProperty.call(pageTag, 'Devoir')) {
          const devoir: Partial<ICarnetDeBordReleveDeNotesDevoir> = {};
          for (const dTag of pageTag.Devoir) {
            if (Object.prototype.hasOwnProperty.call(dTag, 'Note')) {
              devoir.Note = dTag.Note[0]?.['#text'];
            } else if (Object.prototype.hasOwnProperty.call(dTag, 'Bareme')) {
              devoir.Bareme = dTag.Bareme[0]?.['#text'];
            } else if (Object.prototype.hasOwnProperty.call(dTag, 'Matiere')) {
              devoir.Matiere = dTag.Matiere[0]?.['#text'];
            } else if (Object.prototype.hasOwnProperty.call(dTag, 'Date')) {
              devoir.DateString = dTag.Date[0]?.['#text'].toString();
              devoir.Date = devoir.DateString ? moment(dTag.Date[0]?.['#text'].toString()) : undefined;
            }
          }
          if (devoir.Date && devoir.Date.diff(now) < 0) {
            PageReleveDeNotes.DevoirsPast?.push(devoir as ICarnetDeBordReleveDeNotesDevoir);
          } else {
            PageReleveDeNotes.DevoirsFuture?.push(devoir as ICarnetDeBordReleveDeNotesDevoir);
          }
        }
      }
      PageReleveDeNotes!.DevoirsPast = sortCarnetDeBordItems(PageReleveDeNotes!.DevoirsPast!);
      PageReleveDeNotes!.DevoirsFuture = sortCarnetDeBordItems(PageReleveDeNotes!.DevoirsFuture!);
      (ret as ICarnetDeBord).PageReleveDeNotes = PageReleveDeNotes as ICarnetDeBord['PageReleveDeNotes'];
    }

    // VieScolaire
    else if (Object.prototype.hasOwnProperty.call(tag, 'PageVieScolaire')) {
      const PageVieScolaire: Partial<ICarnetDeBord['PageVieScolaire']> = {};
      if (!PageVieScolaire.VieScolairePast) PageVieScolaire.VieScolairePast = [];
      if (!PageVieScolaire.VieScolaireFuture) PageVieScolaire.VieScolaireFuture = [];
      for (const pageTag of tag.PageVieScolaire) {
        if (Object.prototype.hasOwnProperty.call(pageTag, 'Titre')) {
          PageVieScolaire.Titre = pageTag.Titre[0]?.['#text'];
        } else if (Object.prototype.hasOwnProperty.call(pageTag, 'Absence')) {
          const item: Partial<ICarnetDeBordVieScolaireAbsence> = { type: 'Absence' };
          for (const iTag of pageTag.Absence) {
            if (Object.prototype.hasOwnProperty.call(iTag, 'DateDebut')) {
              item.DateDebutString = iTag.DateDebut[0]?.['#text'].toString();
              item.DateDebut = item.DateDebutString ? moment(iTag.DateDebut[0]?.['#text'].toString()) : undefined;
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'DateFin')) {
              item.DateFinString = iTag.DateFin[0]?.['#text'].toString();
              item.DateFin = item.DateFinString ? moment(iTag.DateFin[0]?.['#text'].toString()) : undefined;
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'EstOuverte')) {
              item.EstOuverte = iTag.EstOuverte[0]?.['#text'];
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'Justifie')) {
              item.Justifie = iTag.Justifie[0]?.['#text'];
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'Motif')) {
              item.Motif = iTag.Motif[0]?.['#text'];
            }
          }
          if (item.DateDebut && item.DateDebut.diff(now) < 0) {
            PageVieScolaire.VieScolairePast?.push(item as ICarnetDeBordVieScolaireAbsence);
          } else {
            PageVieScolaire.VieScolaireFuture?.push(item as ICarnetDeBordVieScolaireAbsence);
          }
        } else if (Object.prototype.hasOwnProperty.call(pageTag, 'Retard')) {
          const item: Partial<ICarnetDeBordVieScolaireRetard> = { type: 'Retard' };
          for (const iTag of pageTag.Retard) {
            if (Object.prototype.hasOwnProperty.call(iTag, 'Date')) {
              item.DateString = iTag.Date[0]?.['#text'].toString();
              item.Date = item.DateString ? moment(iTag.Date[0]?.['#text'].toString()) : undefined;
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'Justifie')) {
              item.Justifie = iTag.Justifie[0]?.['#text'];
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'Motif')) {
              item.Motif = iTag.Motif[0]?.['#text'];
            }
          }
          if (item.Date && item.Date.diff(now) < 0) {
            PageVieScolaire.VieScolairePast?.push(item as ICarnetDeBordVieScolaireRetard);
          } else {
            PageVieScolaire.VieScolaireFuture?.push(item as ICarnetDeBordVieScolaireRetard);
          }
        } else if (Object.prototype.hasOwnProperty.call(pageTag, 'PassageInfirmerie')) {
          const item: Partial<ICarnetDeBordVieScolairePassageInfirmerie> = { type: 'PassageInfirmerie' };
          for (const iTag of pageTag.PassageInfirmerie) {
            if (Object.prototype.hasOwnProperty.call(iTag, 'Date')) {
              item.DateString = iTag.Date[0]?.['#text'].toString();
              item.Date = item.DateString ? moment(iTag.Date[0]?.['#text'].toString()) : undefined;
            }
          }
          if (item.Date && item.Date.diff(now) < 0) {
            PageVieScolaire.VieScolairePast?.push(item as ICarnetDeBordVieScolairePassageInfirmerie);
          } else {
            PageVieScolaire.VieScolaireFuture?.push(item as ICarnetDeBordVieScolairePassageInfirmerie);
          }
        } else if (Object.prototype.hasOwnProperty.call(pageTag, 'Punition')) {
          const item: Partial<ICarnetDeBordVieScolairePunition> = { type: 'Punition' };
          for (const iTag of pageTag.Punition) {
            if (Object.prototype.hasOwnProperty.call(iTag, 'Date')) {
              item.DateString = iTag.Date[0]?.['#text'].toString();
              item.Date = item.DateString ? moment(iTag.Date[0]?.['#text'].toString()) : undefined;
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'Nature')) {
              item.Nature = iTag.Nature[0]?.['#text'];
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'Matiere')) {
              item.Matiere = iTag.Matiere[0]?.['#text'];
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'Motif')) {
              item.Motif = iTag.Motif[0]?.['#text'];
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'Circonstances')) {
              item.Circonstances = iTag.Circonstances[0]?.['#text'];
            }
          }
          if (item.Date && item.Date.diff(now) < 0) {
            PageVieScolaire.VieScolairePast?.push(item as ICarnetDeBordVieScolairePunition);
          } else {
            PageVieScolaire.VieScolaireFuture?.push(item as ICarnetDeBordVieScolairePunition);
          }
        } else if (Object.prototype.hasOwnProperty.call(pageTag, 'Sanction')) {
          const item: Partial<ICarnetDeBordVieScolaireSanction> = { type: 'Sanction' };
          for (const iTag of pageTag.Sanction) {
            if (Object.prototype.hasOwnProperty.call(iTag, 'Date')) {
              item.DateString = iTag.Date[0]?.['#text'].toString();
              item.Date = item.DateString ? moment(iTag.Date[0]?.['#text'].toString()) : undefined;
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'Nature')) {
              item.Nature = iTag.Nature[0]?.['#text'];
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'Motif')) {
              item.Motif = iTag.Motif[0]?.['#text'];
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'Circonstances')) {
              item.Circonstances = iTag.Circonstances[0]?.['#text'];
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'Duree')) {
              item.Duree = iTag.Duree[0]?.['#text'];
            }
          }
          if (item.Date && item.Date.diff(now) < 0) {
            PageVieScolaire.VieScolairePast?.push(item as ICarnetDeBordVieScolaireSanction);
          } else {
            PageVieScolaire.VieScolaireFuture?.push(item as ICarnetDeBordVieScolaireSanction);
          }
        } else if (Object.prototype.hasOwnProperty.call(pageTag, 'Observation')) {
          const item: Partial<ICarnetDeBordVieScolaireObservation> = { type: 'Observation' };
          for (const iTag of pageTag.Observation) {
            if (Object.prototype.hasOwnProperty.call(iTag, 'Date')) {
              item.DateString = iTag.Date[0]?.['#text'].toString();
              item.Date = item.DateString ? moment(iTag.Date[0]?.['#text'].toString()) : undefined;
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'Demandeur')) {
              item.Demandeur = iTag.Demandeur[0]?.['#text'];
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'Matiere')) {
              item.Matiere = iTag.Matiere[0]?.['#text'];
            } else if (Object.prototype.hasOwnProperty.call(iTag, 'Observation')) {
              item.Observation = iTag.Observation[0]?.['#text'];
            }
          }
          if (item.Date && item.Date.diff(now) < 0) {
            PageVieScolaire.VieScolairePast?.push(item as ICarnetDeBordVieScolaireObservation);
          } else {
            PageVieScolaire.VieScolaireFuture?.push(item as ICarnetDeBordVieScolaireObservation);
          }
        }
      }
      PageVieScolaire!.VieScolairePast = sortCarnetDeBordItems(PageVieScolaire!.VieScolairePast!);
      PageVieScolaire!.VieScolaireFuture = sortCarnetDeBordItems(PageVieScolaire!.VieScolaireFuture!);
      (ret as ICarnetDeBord).PageVieScolaire = PageVieScolaire as ICarnetDeBord['PageVieScolaire'];
    } else if (Object.prototype.hasOwnProperty.call(tag, 'PagePronote')) {
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
  children: UserChildrenFlattened,
): ICarnetDeBord | undefined {
  const found = {} as { firstName?: string; lastName?: string; idPronote?: string };
  for (const tag of eleve) {
    if (Object.prototype.hasOwnProperty.call(tag, 'Prenom')) {
      (found as Required<typeof found>).firstName = tag.Prenom[0]?.['#text'];
    } else if (Object.prototype.hasOwnProperty.call(tag, 'Nom')) {
      (found as Required<typeof found>).lastName = tag.Nom[0]?.['#text'];
    } else if (Object.prototype.hasOwnProperty.call(tag, 'IdentifiantPronote')) {
      (found as Required<typeof found>).idPronote = tag.IdentifiantPronote[0]?.['#text'];
    }
  }
  const correspondsTo = children.find(c => c.firstName === found.firstName && c.lastName === found.lastName);
  if (!correspondsTo) {
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

function carnetDeBordAdapter(data: ICarnetDeBordBackend, children: UserChildrenFlattened): ICarnetDeBord[] {
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
    cdb.xmlResponse = parser.parse(cdb.xmlResponse);

    const root = cdb.xmlResponse[0] as any; // `any` is used to represent the server raw xml in json.
    if (Object.prototype.hasOwnProperty.call(root, 'Parent')) {
      for (const tag of root.Parent) {
        if (Object.prototype.hasOwnProperty.call(tag, 'Eleve')) {
          const parsedEleve = carnetDeBordAdapterParent(tag.Eleve, cdb, children);
          if (parsedEleve) retAsObject[parsedEleve.id] = parsedEleve;
        }
      }
    } else if (Object.prototype.hasOwnProperty.call(root, 'Eleve')) {
      const parsedEleve = carnetDeBordAdapterEleve(root.Eleve, cdb);
      const session = assertSession();
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

export default {
  get: async (session: AuthLoggedAccount, children: UserChildrenFlattened, matchingApps: IEntcoreApp[]) => {
    const api = `/sso/pronote`;
    let data = await fetchWithCache(api, undefined, undefined, undefined, async r => r);
    if (!data || typeof data === 'string') throw new Error('[carnetDeBord] received data is not Response.');
    if (data.status >= 500 && data.status < 600) {
      // If 50x, call every connector manually
      await Promise.all(
        matchingApps.map(async app => {
          const url = await redirect(session, app.address, undefined, true);
          if (url) await fetch(url);
          CookieManager.clearAll(); // No signature needed here, it's external url containing a custom ticket
        }),
      );
      // Then, retry
      data = await fetchWithCache(api, undefined, undefined, undefined, async r => r);
      if (!data || typeof data === 'string') throw new Error('[carnetDeBord] received data is not Response.');
      if (data.status >= 500 && data.status < 600) {
        throw new PronoteCdbInitError('[carnetDeBord] 50x encourntered after trying to init connectors');
      }
    }
    const json = (await (data as Response).json()) as ICarnetDeBordBackend;
    return carnetDeBordAdapter(json, children);
    // Every other encountered error will be thrown.
  },
};
