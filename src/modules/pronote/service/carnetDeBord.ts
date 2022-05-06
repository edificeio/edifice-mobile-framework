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
  ICarnetDeBord__CahierDeTextes,
  ICarnetDeBord__CahierDeTextes_ContenuDeCours,
  ICarnetDeBord__CahierDeTextes_TravailAFaire,
  ICarnetDeBord__Competences_Domaine,
  ICarnetDeBord__Competences_Evaluation,
  ICarnetDeBord__Competences_Item,
  ICarnetDeBord__ReleveDeNotes_Devoir,
  ICarnetDeBord__VieScolaire_Absence,
  ICarnetDeBord__VieScolaire_Observation,
  ICarnetDeBord__VieScolaire_PassageInfirmerie,
  ICarnetDeBord__VieScolaire_Punition,
  ICarnetDeBord__VieScolaire_Retard,
  ICarnetDeBord__VieScolaire_Sanction,
  IPronoteConnectorInfo,
} from '../state/carnetDeBord';

export type ICarnetDeBordBackend = Array<
  IPronoteConnectorInfo & {
    xmlResponse: string;
  }
>;
function carnetDeBordAdapter(data: ICarnetDeBordBackend, children: IChildrenInfo): ICarnetDeBord[] {
  const ret: ICarnetDeBord[] = [];
  data.forEach(cdb => {
    const parser = new XMLParser({
      allowBooleanAttributes: true,
      ignoreDeclaration: true,
      preserveOrder: true,
    });
    // console.log('xmlToParse', cdb.xmlResponse);
    cdb.xmlResponse = parser.parse(cdb.xmlResponse);
    console.log('service - parsed xml', cdb.xmlResponse);

    const root = cdb.xmlResponse[0];
    if (root.hasOwnProperty('Parent')) {
      for (const tag of root['Parent']) {
        if (tag.hasOwnProperty('Eleve')) {
          const parsedEleve = carnetDeBordAdapter_Parent(tag['Eleve'], cdb, children);
          if (parsedEleve) ret.push(parsedEleve);
        }
      }
    } else if (root.hasOwnProperty('Eleve')) {
      const parsedEleve = carnetDeBordAdapter_Eleve(root['Eleve'], cdb);
      const session = getUserSession();
      if (parsedEleve)
        (ret as ICarnetDeBord[]).push({
          ...parsedEleve,
          displayName: session.user.displayName,
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          id: session.user.id,
        });
    } else {
      throw new Error(`Malformed xml. Do not contain either Parent or Eleve tag.`);
    }
  });
  return ret;
}

function carnetDeBordAdapter_Parent(
  eleve: any,
  connector: IPronoteConnectorInfo,
  children: IChildrenInfo,
): ICarnetDeBord | undefined {
  const found = {} as { firstName?: string; lastName?: string; idPronote?: string };
  for (const tag of eleve) {
    if (tag.hasOwnProperty('Prenom')) {
      (found as Required<typeof found>).firstName = tag['Prenom'][0]?.['#text'];
    } else if (tag.hasOwnProperty('Nom')) {
      (found as Required<typeof found>).lastName = tag['Nom'][0]?.['#text'];
    } else if (tag.hasOwnProperty('IdentifiantPronote')) {
      (found as Required<typeof found>).idPronote = tag['IdentifiantPronote'][0]?.['#text'];
    }
  }
  const correspondsTo = children.find(c => c.firstName === found.firstName && c.lastName === found.lastName);
  if (!correspondsTo) {
    console.warn(`children ${found.firstName} ${found.lastName} not found`);
    return undefined;
  }
  const ret = {
    ...carnetDeBordAdapter_Eleve(eleve, connector),
    displayName: correspondsTo.displayName,
    firstName: correspondsTo.firstName,
    lastName: correspondsTo.lastName,
    id: correspondsTo.id,
    idPronote: (found as Required<typeof found>).idPronote,
  };
  return ret;
}

function carnetDeBordAdapter_Eleve(data: any, connector: IPronoteConnectorInfo): ICarnetDeBord {
  const ret = {
    structureId: connector.structureId,
    address: connector.address,
  };

  console.log('service - eleve data', data);
  for (const tag of data) {
    // CahierDeTextes

    if (tag.hasOwnProperty('PageCahierDeTextes')) {
      const PageCahierDeTextes = {};
      for (const cdtTag of tag['PageCahierDeTextes']) {
        if (!(PageCahierDeTextes as ICarnetDeBord['PageCahierDeTextes']).CahierDeTextes)
          (PageCahierDeTextes as ICarnetDeBord['PageCahierDeTextes']).CahierDeTextes = [];
        if (cdtTag.hasOwnProperty('Titre')) {
          (PageCahierDeTextes as ICarnetDeBord['PageCahierDeTextes']).Titre = cdtTag['Titre'][0]?.['#text'];
        } else if (cdtTag.hasOwnProperty('CahierDeTextes')) {
          const cdt = {};
          for (const cdtItemTag of cdtTag['CahierDeTextes']) {
            if (cdtItemTag.hasOwnProperty('Date')) {
              (cdt as ICarnetDeBord__CahierDeTextes).DateString = cdtItemTag['Date'][0]?.['#text'];
              (cdt as ICarnetDeBord__CahierDeTextes).Date = moment(cdtItemTag['Date'][0]?.['#text']);
            } else if (cdtItemTag.hasOwnProperty('Matiere')) {
              (cdt as ICarnetDeBord__CahierDeTextes).Matiere = cdtItemTag['Matiere'][0]?.['#text'];
            } else if (cdtItemTag.hasOwnProperty('ContenuDeCours')) {
              const cdc = {};
              if (!(cdt as ICarnetDeBord__CahierDeTextes).ContenuDeCours) {
                (cdt as ICarnetDeBord__CahierDeTextes).ContenuDeCours = [];
              }
              for (const cdctag of cdtItemTag['ContenuDeCours']) {
                if (cdctag.hasOwnProperty('Titre')) {
                  (cdc as ICarnetDeBord__CahierDeTextes_ContenuDeCours).Titre = cdctag['Titre'][0]?.['#text'];
                } else if (cdctag.hasOwnProperty('Categorie')) {
                  (cdc as ICarnetDeBord__CahierDeTextes_ContenuDeCours).Categorie = cdctag['Categorie'][0]?.['#text'];
                } else if (cdctag.hasOwnProperty('Descriptif')) {
                  (cdc as ICarnetDeBord__CahierDeTextes_ContenuDeCours).Descriptif = cdctag['Descriptif'][0]?.['#text'];
                } else if (cdctag.hasOwnProperty('PieceJointe')) {
                  if (!(cdc as ICarnetDeBord__CahierDeTextes_ContenuDeCours).PieceJointe) {
                    (cdc as ICarnetDeBord__CahierDeTextes_ContenuDeCours).PieceJointe = [];
                  }
                  (cdc as ICarnetDeBord__CahierDeTextes_ContenuDeCours).PieceJointe?.push(cdctag['PieceJointe'][0]?.['#text']);
                } else if (cdctag.hasOwnProperty('SiteInternet')) {
                  if (!(cdc as ICarnetDeBord__CahierDeTextes_ContenuDeCours).SiteInternet) {
                    (cdc as ICarnetDeBord__CahierDeTextes_ContenuDeCours).SiteInternet = [];
                  }
                  (cdc as ICarnetDeBord__CahierDeTextes_ContenuDeCours).SiteInternet?.push(cdctag['SiteInternet'][0]?.['#text']);
                }
              }
              (cdt as ICarnetDeBord__CahierDeTextes).ContenuDeCours?.push(cdc as ICarnetDeBord__CahierDeTextes_ContenuDeCours);
            } else if (cdtItemTag.hasOwnProperty('TravailAFaire')) {
              const taf = {};
              if (!(cdt as ICarnetDeBord__CahierDeTextes).TravailAFaire) {
                (cdt as ICarnetDeBord__CahierDeTextes).TravailAFaire = [];
              }
              for (const taftag of cdtItemTag['TravailAFaire']) {
                if (taftag.hasOwnProperty('PourLe')) {
                  (taf as ICarnetDeBord__CahierDeTextes_TravailAFaire).PourLeString = taftag['PourLe'][0]?.['#text'];
                  (taf as ICarnetDeBord__CahierDeTextes_TravailAFaire).PourLe = moment(taftag['PourLe'][0]?.['#text']);
                } else if (taftag.hasOwnProperty('Descriptif')) {
                  (taf as ICarnetDeBord__CahierDeTextes_TravailAFaire).Descriptif = taftag['Descriptif'][0]?.['#text'];
                } else if (taftag.hasOwnProperty('PieceJointe')) {
                  if (!(taf as ICarnetDeBord__CahierDeTextes_TravailAFaire).PieceJointe) {
                    (taf as ICarnetDeBord__CahierDeTextes_TravailAFaire).PieceJointe = [];
                  }
                  (taf as ICarnetDeBord__CahierDeTextes_TravailAFaire).PieceJointe?.push(taftag['PieceJointe'][0]?.['#text']);
                } else if (taftag.hasOwnProperty('SiteInternet')) {
                  if (!(taf as ICarnetDeBord__CahierDeTextes_TravailAFaire).SiteInternet) {
                    (taf as ICarnetDeBord__CahierDeTextes_TravailAFaire).SiteInternet = [];
                  }
                  (taf as ICarnetDeBord__CahierDeTextes_TravailAFaire).SiteInternet?.push(taftag['SiteInternet'][0]?.['#text']);
                }
              }
              (cdt as ICarnetDeBord__CahierDeTextes).TravailAFaire?.push(taf as ICarnetDeBord__CahierDeTextes_TravailAFaire);
            }
          }
          (PageCahierDeTextes as ICarnetDeBord['PageCahierDeTextes']).CahierDeTextes?.push(cdt as ICarnetDeBord__CahierDeTextes);
        }
      }
      (ret as ICarnetDeBord).PageCahierDeTextes = PageCahierDeTextes as ICarnetDeBord['PageCahierDeTextes'];
    }

    // Competences
    else if (tag.hasOwnProperty('PageCompetences')) {
      const PageCompetences = {};
      for (const pageTag of tag['PageCompetences']) {
        if (!(PageCompetences as ICarnetDeBord['PageCompetences']).Competences)
          (PageCompetences as ICarnetDeBord['PageCompetences']).Competences = [];
        if (pageTag.hasOwnProperty('Titre')) {
          (PageCompetences as ICarnetDeBord['PageCompetences']).Titre = pageTag['Titre'][0]?.['#text'];
        } else if (pageTag.hasOwnProperty('Item')) {
          const item = { type: 'Item' };
          for (const itemTag of pageTag['Item']) {
            parseCompetencesItem(itemTag, item);
          }
          (PageCompetences as ICarnetDeBord['PageCompetences']).Competences?.push(item as ICarnetDeBord__Competences_Item);
        } else if (pageTag.hasOwnProperty('Domaine')) {
          const item = { type: 'Domaine' };
          for (const itemTag of pageTag['Domaine']) {
            parseCompetencesItem(itemTag, item);
          }
          (PageCompetences as ICarnetDeBord['PageCompetences']).Competences?.push(item as ICarnetDeBord__Competences_Domaine);
        } else if (pageTag.hasOwnProperty('Evaluation')) {
          const item = { type: 'Evaluation' };
          for (const itemTag of pageTag['Evaluation']) {
            parseCompetencesItem(itemTag, item);
            if (itemTag.hasOwnProperty('Item')) {
              (item as ICarnetDeBord__Competences_Evaluation).Item = itemTag['Item'][0]?.['#text'];
            }
          }
          (PageCompetences as ICarnetDeBord['PageCompetences']).Competences?.push(item as ICarnetDeBord__Competences_Evaluation);
        }

        (ret as ICarnetDeBord).PageCompetences = PageCompetences as ICarnetDeBord['PageCompetences'];
      }
    }

    // ReleveDeNotes
    else if (tag.hasOwnProperty('PageReleveDeNotes')) {
      const PageReleveDeNotes = {};
      for (const pageTag of tag['PageReleveDeNotes']) {
        if (pageTag.hasOwnProperty('Titre')) {
          (PageReleveDeNotes as ICarnetDeBord['PageReleveDeNotes']).Titre = pageTag['Titre'][0]?.['#text'];
        } else if (pageTag.hasOwnProperty('Message')) {
          (PageReleveDeNotes as ICarnetDeBord['PageReleveDeNotes']).Message = pageTag['Message'][0]?.['#text'];
        } else if (pageTag.hasOwnProperty('Devoir')) {
          if (!(PageReleveDeNotes as ICarnetDeBord['PageReleveDeNotes']).Devoir)
            (PageReleveDeNotes as ICarnetDeBord['PageReleveDeNotes']).Devoir = [];
          const devoir = {};
          for (const dTag of pageTag['Devoir']) {
            if (dTag.hasOwnProperty('Note')) {
              (devoir as ICarnetDeBord__ReleveDeNotes_Devoir).Note = dTag['Note'][0]?.['#text'];
            } else if (dTag.hasOwnProperty('Bareme')) {
              (devoir as ICarnetDeBord__ReleveDeNotes_Devoir).Bareme = dTag['Bareme'][0]?.['#text'];
            } else if (dTag.hasOwnProperty('Matiere')) {
              (devoir as ICarnetDeBord__ReleveDeNotes_Devoir).Matiere = dTag['Matiere'][0]?.['#text'];
            } else if (dTag.hasOwnProperty('Date')) {
              (devoir as ICarnetDeBord__ReleveDeNotes_Devoir).DateString = dTag['Date'][0]?.['#text'];
              (devoir as ICarnetDeBord__ReleveDeNotes_Devoir).Date = moment(dTag['Date'][0]?.['#text']);
            }
          }
          (PageReleveDeNotes as ICarnetDeBord['PageReleveDeNotes']).Devoir?.push(devoir as ICarnetDeBord__ReleveDeNotes_Devoir);
        }
      }
      (ret as ICarnetDeBord).PageReleveDeNotes = PageReleveDeNotes as ICarnetDeBord['PageReleveDeNotes'];
    }

    // VieScolaire
    else if (tag.hasOwnProperty('PageVieScolaire')) {
      const PageVieScolaire = {};
      if (!(PageVieScolaire as ICarnetDeBord['PageVieScolaire']).VieScolaire)
        (PageVieScolaire as ICarnetDeBord['PageVieScolaire']).VieScolaire = [];
      for (const pageTag of tag['PageVieScolaire']) {
        if (pageTag.hasOwnProperty('Titre')) {
          (PageVieScolaire as ICarnetDeBord['PageVieScolaire']).Titre = pageTag['Titre'][0]?.['#text'];
        } else if (pageTag.hasOwnProperty('Absence')) {
          const item = { type: 'Absence' };
          for (const iTag of pageTag['Absence']) {
            if (iTag.hasOwnProperty('DateDebut')) {
              (item as ICarnetDeBord__VieScolaire_Absence).DateDebutString = iTag['DateDebut'][0]?.['#text'];
              (item as ICarnetDeBord__VieScolaire_Absence).DateDebut = moment(iTag['DateDebut'][0]?.['#text']);
            } else if (iTag.hasOwnProperty('DateFin')) {
              (item as ICarnetDeBord__VieScolaire_Absence).DateFinString = iTag['DateFin'][0]?.['#text'];
              (item as ICarnetDeBord__VieScolaire_Absence).DateFin = moment(iTag['DateFin'][0]?.['#text']);
            } else if (iTag.hasOwnProperty('EstOuverte')) {
              (item as ICarnetDeBord__VieScolaire_Absence).EstOuverte = iTag['EstOuverte'][0]?.['#text'];
            } else if (iTag.hasOwnProperty('Justifie')) {
              (item as ICarnetDeBord__VieScolaire_Absence).Justifie = iTag['Justifie'][0]?.['#text'];
            } else if (iTag.hasOwnProperty('Motif')) {
              (item as ICarnetDeBord__VieScolaire_Absence).Motif = iTag['Motif'][0]?.['#text'];
            }
          }
          (PageVieScolaire as ICarnetDeBord['PageVieScolaire']).VieScolaire?.push(item as ICarnetDeBord__VieScolaire_Absence);
        } else if (pageTag.hasOwnProperty('Retard')) {
          const item = { type: 'Retard' };
          for (const iTag of pageTag['Retard']) {
            if (iTag.hasOwnProperty('Date')) {
              (item as ICarnetDeBord__VieScolaire_Retard).DateString = iTag['Date'][0]?.['#text'];
              (item as ICarnetDeBord__VieScolaire_Retard).Date = moment(iTag['Date'][0]?.['#text']);
            } else if (iTag.hasOwnProperty('Justifie')) {
              (item as ICarnetDeBord__VieScolaire_Retard).Justifie = iTag['Justifie'][0]?.['#text'];
            } else if (iTag.hasOwnProperty('Motif')) {
              (item as ICarnetDeBord__VieScolaire_Retard).Motif = iTag['Motif'][0]?.['#text'];
            }
          }
          (PageVieScolaire as ICarnetDeBord['PageVieScolaire']).VieScolaire?.push(item as ICarnetDeBord__VieScolaire_Retard);
        } else if (pageTag.hasOwnProperty('PassageInfirmerie')) {
          const item = { type: 'PassageInfirmerie' };
          for (const iTag of pageTag['PassageInfirmerie']) {
            if (iTag.hasOwnProperty('Date')) {
              (item as ICarnetDeBord__VieScolaire_PassageInfirmerie).DateString = iTag['Date'][0]?.['#text'];
              (item as ICarnetDeBord__VieScolaire_PassageInfirmerie).Date = moment(iTag['Date'][0]?.['#text']);
            }
          }
          (PageVieScolaire as ICarnetDeBord['PageVieScolaire']).VieScolaire?.push(
            item as ICarnetDeBord__VieScolaire_PassageInfirmerie,
          );
        } else if (pageTag.hasOwnProperty('Punition')) {
          const item = { type: 'Punition' };
          for (const iTag of pageTag['Punition']) {
            if (iTag.hasOwnProperty('Date')) {
              (item as ICarnetDeBord__VieScolaire_Punition).DateString = iTag['Date'][0]?.['#text'];
              (item as ICarnetDeBord__VieScolaire_Punition).Date = moment(iTag['Date'][0]?.['#text']);
            } else if (iTag.hasOwnProperty('Nature')) {
              (item as ICarnetDeBord__VieScolaire_Punition).Nature = iTag['Nature'][0]?.['#text'];
            } else if (iTag.hasOwnProperty('Matiere')) {
              (item as ICarnetDeBord__VieScolaire_Punition).Matiere = iTag['Matiere'][0]?.['#text'];
            } else if (iTag.hasOwnProperty('Motif')) {
              (item as ICarnetDeBord__VieScolaire_Punition).Motif = iTag['Motif'][0]?.['#text'];
            } else if (iTag.hasOwnProperty('Circonstances')) {
              (item as ICarnetDeBord__VieScolaire_Punition).Circonstances = iTag['Circonstances'][0]?.['#text'];
            }
          }
          (PageVieScolaire as ICarnetDeBord['PageVieScolaire']).VieScolaire?.push(item as ICarnetDeBord__VieScolaire_Punition);
        } else if (pageTag.hasOwnProperty('Sanction')) {
          const item = { type: 'Sanction' };
          for (const iTag of pageTag['Sanction']) {
            if (iTag.hasOwnProperty('Date')) {
              (item as ICarnetDeBord__VieScolaire_Sanction).DateString = iTag['Date'][0]?.['#text'];
              (item as ICarnetDeBord__VieScolaire_Sanction).Date = moment(iTag['Date'][0]?.['#text']);
            } else if (iTag.hasOwnProperty('Nature')) {
              (item as ICarnetDeBord__VieScolaire_Sanction).Nature = iTag['Nature'][0]?.['#text'];
            } else if (iTag.hasOwnProperty('Motif')) {
              (item as ICarnetDeBord__VieScolaire_Sanction).Motif = iTag['Motif'][0]?.['#text'];
            } else if (iTag.hasOwnProperty('Circonstances')) {
              (item as ICarnetDeBord__VieScolaire_Sanction).Circonstances = iTag['Circonstances'][0]?.['#text'];
            } else if (iTag.hasOwnProperty('Duree')) {
              (item as ICarnetDeBord__VieScolaire_Sanction).Duree = iTag['Duree'][0]?.['#text'];
            }
          }
          (PageVieScolaire as ICarnetDeBord['PageVieScolaire']).VieScolaire?.push(item as ICarnetDeBord__VieScolaire_Sanction);
        } else if (pageTag.hasOwnProperty('Observation')) {
          const item = { type: 'Observation' };
          for (const iTag of pageTag['Observation']) {
            if (iTag.hasOwnProperty('Date')) {
              (item as ICarnetDeBord__VieScolaire_Observation).DateString = iTag['Date'][0]?.['#text'];
              (item as ICarnetDeBord__VieScolaire_Observation).Date = moment(iTag['Date'][0]?.['#text']);
            } else if (iTag.hasOwnProperty('Demandeur')) {
              (item as ICarnetDeBord__VieScolaire_Observation).Demandeur = iTag['Demandeur'][0]?.['#text'];
            } else if (iTag.hasOwnProperty('Matiere')) {
              (item as ICarnetDeBord__VieScolaire_Observation).Matiere = iTag['Matiere'][0]?.['#text'];
            } else if (iTag.hasOwnProperty('Observation')) {
              (item as ICarnetDeBord__VieScolaire_Observation).Observation = iTag['Observation'][0]?.['#text'];
            }
          }
          (PageVieScolaire as ICarnetDeBord['PageVieScolaire']).VieScolaire?.push(item as ICarnetDeBord__VieScolaire_Observation);
        }
      }
      (ret as ICarnetDeBord).PageVieScolaire = PageVieScolaire as ICarnetDeBord['PageVieScolaire'];
    }
  }

  return ret as ICarnetDeBord;
}

const parseCompetencesItem = (itemTag, item) => {
  if (itemTag.hasOwnProperty('Date')) {
    (item as ICarnetDeBord__Competences_Item).DateString = itemTag['Date'][0]?.['#text'];
    (item as ICarnetDeBord__Competences_Item).Date = moment(itemTag['Date'][0]?.['#text']);
  } else if (itemTag.hasOwnProperty('Competence')) {
    (item as ICarnetDeBord__Competences_Item).Competence = itemTag['Competence'][0]?.['#text'];
  } else if (itemTag.hasOwnProperty('Intitule')) {
    (item as ICarnetDeBord__Competences_Item).Intitule = itemTag['Intitule'][0]?.['#text'];
  } else if (itemTag.hasOwnProperty('Matiere')) {
    (item as ICarnetDeBord__Competences_Item).Matiere = itemTag['Matiere'][0]?.['#text'];
  } else if (itemTag.hasOwnProperty('NiveauDAcquisition')) {
    const nda = {};
    for (const ndaTag of itemTag['NiveauDAcquisition']) {
      if (ndaTag.hasOwnProperty('Genre')) {
        (nda as ICarnetDeBord__Competences_Item['NiveauDAcquisition']).Genre = ndaTag['Genre'][0]?.['#text'];
      } else if (ndaTag.hasOwnProperty('Libelle')) {
        (nda as ICarnetDeBord__Competences_Item['NiveauDAcquisition']).Libelle = ndaTag['Libelle'][0]?.['#text'];
      }
    }
    (item as ICarnetDeBord__Competences_Item).NiveauDAcquisition = nda as ICarnetDeBord__Competences_Item['NiveauDAcquisition'];
  }
};

export type IChildrenInfo = {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
}[];

export default {
  get: async (session: IUserSession, children: IChildrenInfo) => {
    const api = `/sso/pronote`;
    await new Promise(resolve => setTimeout(() => resolve(null), 1000));
    // const data = (await fetchJSONWithCache(api)) as ICarnetDeBordBackend;
    const data = [
      {
        structureId: '4be454ea-7f73-475f-835b-ce332f918d22',
        xmlResponse:
          '<?xml version="1.0"?><Parent xmlns="http://www.index-education.com/accueilENT" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://www.index-education.com/accueilENT Parent.xsd" version="1.03"><Eleve><Nom>LINDO</Nom><Prenom>Chloé</Prenom><IdentifiantPronote>KZHWA24CU3BGPN7Q</IdentifiantPronote><PageReleveDeNotes><Titre>Relevé de notes</Titre><Message>Publication du bulletin le 20/02</Message><Devoir page="da89cbc9e593f9c4273356659410b0780a616fc5b398d64ba174e138ae0fd5adb4c4b787aa38a237966c8478db61faea"><Note>15,00</Note><Bareme>20.00</Bareme><Matiere>TECHNOLOGIE</Matiere><Date>2012-03-26</Date></Devoir><Devoir><Note>17,00</Note><Bareme>20.00</Bareme><Matiere>NOTE DE VIE SCOLAIRE</Matiere><Date>2012-03-26</Date></Devoir><Devoir><Note>14,00</Note><Bareme>20.00</Bareme><Matiere>ALLEMAND LV2</Matiere><Date>2012-03-25</Date></Devoir></PageReleveDeNotes><PageCompetences><Titre>Compétences</Titre><Evaluation><Competence>Les principaux éléments de mathématiques et la culture scientifique et technologique</Competence><Item>Raisonner, argumenter, pratiquer une démarche expérimentale ou technologique, démontrer</Item><Intitule>Evaluation</Intitule><Matiere>MATHEMATIQUE</Matiere><NiveauDAcquisition><Genre>2</Genre><Libelle>Acquis</Libelle></NiveauDAcquisition><Date>2012-03-25</Date></Evaluation><Item><Competence>Les principaux éléments de mathématiques et la culture scientifique et technologique</Competence><Intitule>Evaluation</Intitule><Matiere>MATHEMATIQUE</Matiere><NiveauDAcquisition><Genre>2</Genre><Libelle>Acquis</Libelle></NiveauDAcquisition><Date>2012-03-25</Date></Item><Domaine><Competence>Les principaux éléments de mathématiques et la culture scientifique et technologique</Competence><Intitule>Evaluation</Intitule><Matiere>MATHEMATIQUE</Matiere><NiveauDAcquisition><Genre>2</Genre><Libelle>Acquis</Libelle></NiveauDAcquisition><Date>2012-03-25</Date></Domaine></PageCompetences><PageCahierDeTextes><Titre>Cahier de textes</Titre><CahierDeTextes><Matiere>SPE - PHYSIQUE-CHIMIE</Matiere><Date>2022-02-18</Date><ContenuDeCours page="8F58630EBD502FF16033D7568F0D42F2DDEFC5F46A64538AB612E370255B03C9"><Titre>Chimie</Titre><Descriptif>&lt;div style="font-family: Arial; font-size: 13px;"&gt;L9 - Synthèse organique.&lt;/div&gt;\r\n&lt;div style="font-family: Arial; font-size: 13px;"&gt;A : Éléments de nomenclature organique.&lt;/div&gt;\r\n&lt;div style="font-family: Arial; font-size: 13px;"&gt;B : Quelles stratégies adopter lors d\'une synthèse organique ?&lt;/div&gt;\r\n&lt;div style="font-family: Arial; font-size: 13px;"&gt;C : Optimiser une synthèse.&lt;/div&gt;</Descriptif><PieceJointe>2 géométrie, fonctions.doc</PieceJointe><PieceJointe>Une PJ trop de lol</PieceJointe><SiteInternet>http://www.google.com</SiteInternet></ContenuDeCours><ContenuDeCours page="8F58630EBD502FF16033D7568F0D42F2DDEFC5F46A64538AB612E370255B03C9"><Titre>Test</Titre><Descriptif>&lt;div style="font-family: Arial; font-size: 13px;"&gt;L9 - Synthèse organique.&lt;/div&gt;\r\n&lt;div style="font-family: Arial; font-size: 13px;"&gt;A : Éléments de nomenclature organique.&lt;/div&gt;\r\n&lt;div style="font-family: Arial; font-size: 13px;"&gt;B : Quelles stratégies adopter lors d\'une synthèse organique ?&lt;/div&gt;\r\n&lt;div style="font-family: Arial; font-size: 13px;"&gt;C : Optimiser une synthèse.&lt;/div&gt;</Descriptif><SiteInternet>http://www.google.com</SiteInternet></ContenuDeCours><TravailAFaire page="DEEFE0907DD6A9EBACFB1C6DADB5B8149B4A66C17BBC0BFBE3E04B68C1A6614222F67AB68AC4B8164E7F0F2434DAFEBC996061462BB87EDE77389E4DFAE12F55"><Descriptif>&lt;div&gt;Apprendre la leçon du jour.&lt;/div&gt;</Descriptif><PourLe>2022-03-09</PourLe></TravailAFaire><TravailAFaire page="DEEFE0907DD6A9EBACFB1C6DADB5B8149B4A66C17BBC0BFBE3E04B68C1A6614222F67AB68AC4B8164E7F0F2434DAFEBC996061462BB87EDE77389E4DFAE12F55"><Descriptif>&lt;div&gt;Exercices n° 1, 2, 3, 4, 5 et 20 (oralement) 23, 26 (corrigé) 30 et 32 pages 209+&lt;/div&gt;</Descriptif><PourLe>2022-03-09</PourLe><PieceJointe>2 géométrie, fonctions.doc</PieceJointe><PieceJointe>Une PJ trop de lol</PieceJointe><SiteInternet>http://www.google.com</SiteInternet></TravailAFaire></CahierDeTextes><CahierDeTextes><Matiere>OPTION - MATHS EXPERTS</Matiere><Date>2022-02-16</Date><TravailAFaire page="DEEFE0907DD6A9EBACFB1C6DADB5B8149B4A66C17BBC0BFBE3E04B68C1A6614222F67AB68AC4B8164E7F0F2434DAFEBC77ACD0619EE588BE15111C1BF5A0F43B"><Descriptif>&lt;div&gt;Exercices appli 4&lt;/div&gt;</Descriptif><PourLe>2022-03-08</PourLe></TravailAFaire></CahierDeTextes><CahierDeTextes><Matiere>SPE - MATHEMATIQUES</Matiere><Date>2022-02-18</Date><ContenuDeCours page="8F58630EBD502FF16033D7568F0D42F2DDEFC5F46A64538AB612E370255B03C9"><Titre>Equations différentielles </Titre><Categorie>Exercices en classe</Categorie><Descriptif>&lt;div style="font-family: Arial; font-size: 13px;"&gt;Correction de l\'exercice du jour (Voir pj)&lt;/div&gt;\r\n&lt;div style="font-family: Arial; font-size: 13px;"&gt;Début du corrigé de l\'exercice sur l\'équation de l\'oscillateur harmonique (première partie)&lt;/div&gt;\r\n&lt;div style="font-family: Arial; font-size: 13px;"&gt;Bilan du bb et remise des copies .&amp;nbsp;&lt;/div&gt;</Descriptif><PieceJointe>FichiersExternes/ent/B9FE51D40F8282891EE575A5EC573AC0DFEDF0CE82D4695BBCBD6DD2824C90EC77C317629355433707238FA7645914AD45FA40F491215FE6E9394F4B399BF28BE5907C4137CCFC127C5D995F5512A416/Bac_Blanc_correction.pdf</PieceJointe><PieceJointe>FichiersExternes/ent/61413CB85D1F458C8643B2D4ACC4C4A058CAEE888B192B27A94E309CB9FF70D9DC89D3E2761C7C32E053547AAF14288FE8D1B49B447174033320ECBF128420E327249BD2184130E818A4B79FE3B3499A/Corrigé_n°141_p_233_et_123_p_230_eq_diff.pdf</PieceJointe></ContenuDeCours><TravailAFaire page="DEEFE0907DD6A9EBACFB1C6DADB5B8149B4A66C17BBC0BFBE3E04B68C1A6614222F67AB68AC4B8164E7F0F2434DAFEBCA35D55DD3E02B4B800255EA08ABA3C2F"><Descriptif>&lt;div&gt;Terminer l&amp;#039;exercice sur  l&amp;#039;équation différentielle linéaire d&amp;#039;ordre 2 d&amp;#039;un oscillateur harmonique .&lt;/div&gt;</Descriptif><PourLe>2022-03-07</PourLe></TravailAFaire></CahierDeTextes></PageCahierDeTextes><PageVieScolaire><Titre>Vie Scolaire</Titre><Absence><DateDebut>2012-03-25T09:00:00</DateDebut><DateFin>2012-03-25T16:00:00</DateFin><EstOuverte>false</EstOuverte><Justifie>false</Justifie><Motif></Motif></Absence><Punition><Date>2012-04-23</Date><Nature>Exclusion de cours</Nature><Matiere>MATHEMATIQUES</Matiere><Motif>Dissipation</Motif></Punition><Observation><Date>2012-04-23T09:00:00</Date><Demandeur>M. PROFESSEUR BERNARD</Demandeur><Matiere>MATHEMATIQUES</Matiere><Observation>Affaires oubliées</Observation></Observation></PageVieScolaire><PagePronote page="A064210D32CDCC7A636F807151E66D0F4394CFA2CD7882C6EC22FF8EE93BF62F" nom="Page d\'accueil"/><PagePronote page="DEEFE0907DD6A9EBACFB1C6DADB5B814C73F555E7E272F6EC909CFF6A024AA6B" nom="Travail à faire à la maison"/><PagePronote page="8F58630EBD502FF16033D7568F0D42F2DDEFC5F46A64538AB612E370255B03C9" nom="Contenu et ressources pédagogiques"/><PagePronote page="C16AF6104CAE2CF131DFA304072B3824DAD5E24BBF1222B2A0254C1B5EA69E44" nom="Détail des notes"/><PagePronote page="BFAB90887F65912C42F74F304D736FCE44A72C2F8225080DD0A0D729DC4DE669" nom="Mon relevé de notes"/><PagePronote page="4B2F3D439677391BED155A549A71F2AF70547B4CDE9F910239A6610A0F39F7E5" nom="Bulletin de l\'élève"/><PagePronote page="76E6B06FC7F1466212834424E835421BC304827211607EC6ED8D9F3CA9562EB6" nom="Détail des évaluations"/><PagePronote page="D788475225004AE89B4B662475B2F533A108AA0EDEB6CF43CDF5C4472413018C" nom="Évaluations par compétence"/><PagePronote page="9EC6D9250824146E30F1A03243EE4259D29F66018F71CA90AC6D4E1596ADA7AE" nom="Bilan périodique de l\'élève"/><PagePronote page="B4916D58F3246EEDF5B6C57FD61A18E98F9754CEB1BB483CA9438F6A5A8542D5" nom="Récapitulatif des évènements de la vie scolaire"/></Eleve><Eleve><Nom>BALO</Nom><Prenom>Pierre-Nicolas</Prenom><IdentifiantPronote>MZHWA24CU3BGPN7R</IdentifiantPronote><PageReleveDeNotes><Titre>Relevé de notes</Titre></PageReleveDeNotes><PageCompetences><Titre>Compétences</Titre></PageCompetences><PageCahierDeTextes><Titre>Cahier de textes</Titre><CahierDeTextes><Matiere>SPE - PHYSIQUE-CHIMIE</Matiere><Date>2022-02-18</Date><ContenuDeCours page="8F58630EBD502FF16033D7568F0D42F2DDEFC5F46A64538AB612E370255B03C9"><Titre>Chimie</Titre><Descriptif>&lt;div style="font-family: Arial; font-size: 13px;"&gt;L9 - Synthèse organique.&lt;/div&gt;\r\n&lt;div style="font-family: Arial; font-size: 13px;"&gt;A : Éléments de nomenclature organique.&lt;/div&gt;\r\n&lt;div style="font-family: Arial; font-size: 13px;"&gt;B : Quelles stratégies adopter lors d\'une synthèse organique ?&lt;/div&gt;\r\n&lt;div style="font-family: Arial; font-size: 13px;"&gt;C : Optimiser une synthèse.&lt;/div&gt;</Descriptif></ContenuDeCours><TravailAFaire page="DEEFE0907DD6A9EBACFB1C6DADB5B8149B4A66C17BBC0BFBE3E04B68C1A6614222F67AB68AC4B8164E7F0F2434DAFEBC996061462BB87EDE77389E4DFAE12F55"><Descriptif>&lt;div&gt;Apprendre la leçon du jour.&lt;/div&gt;</Descriptif><PourLe>2022-03-09</PourLe></TravailAFaire><TravailAFaire page="DEEFE0907DD6A9EBACFB1C6DADB5B8149B4A66C17BBC0BFBE3E04B68C1A6614222F67AB68AC4B8164E7F0F2434DAFEBC996061462BB87EDE77389E4DFAE12F55"><Descriptif>&lt;div&gt;Exercices n° 1, 2, 3, 4, 5 et 20 (oralement) 23, 26 (corrigé) 30 et 32 pages 209+&lt;/div&gt;</Descriptif><PourLe>2022-03-09</PourLe></TravailAFaire></CahierDeTextes><CahierDeTextes><Matiere>OPTION - MATHS EXPERTS</Matiere><Date>2022-02-16</Date><TravailAFaire page="DEEFE0907DD6A9EBACFB1C6DADB5B8149B4A66C17BBC0BFBE3E04B68C1A6614222F67AB68AC4B8164E7F0F2434DAFEBC77ACD0619EE588BE15111C1BF5A0F43B"><Descriptif>&lt;div&gt;Exercices appli 4&lt;/div&gt;</Descriptif><PourLe>2022-03-08</PourLe></TravailAFaire></CahierDeTextes><CahierDeTextes><Matiere>SPE - MATHEMATIQUES</Matiere><Date>2022-02-18</Date><ContenuDeCours page="8F58630EBD502FF16033D7568F0D42F2DDEFC5F46A64538AB612E370255B03C9"><Titre>Equations différentielles </Titre><Categorie>Exercices en classe</Categorie><Descriptif>&lt;div style="font-family: Arial; font-size: 13px;"&gt;Correction de l\'exercice du jour (Voir pj)&lt;/div&gt;\r\n&lt;div style="font-family: Arial; font-size: 13px;"&gt;Début du corrigé de l\'exercice sur l\'équation de l\'oscillateur harmonique (première partie)&lt;/div&gt;\r\n&lt;div style="font-family: Arial; font-size: 13px;"&gt;Bilan du bb et remise des copies .&amp;nbsp;&lt;/div&gt;</Descriptif><PieceJointe>FichiersExternes/ent/B9FE51D40F8282891EE575A5EC573AC0DFEDF0CE82D4695BBCBD6DD2824C90EC77C317629355433707238FA7645914AD45FA40F491215FE6E9394F4B399BF28BE5907C4137CCFC127C5D995F5512A416/Bac_Blanc_correction.pdf</PieceJointe><PieceJointe>FichiersExternes/ent/61413CB85D1F458C8643B2D4ACC4C4A058CAEE888B192B27A94E309CB9FF70D9DC89D3E2761C7C32E053547AAF14288FE8D1B49B447174033320ECBF128420E327249BD2184130E818A4B79FE3B3499A/Corrigé_n°141_p_233_et_123_p_230_eq_diff.pdf</PieceJointe></ContenuDeCours><TravailAFaire page="DEEFE0907DD6A9EBACFB1C6DADB5B8149B4A66C17BBC0BFBE3E04B68C1A6614222F67AB68AC4B8164E7F0F2434DAFEBCA35D55DD3E02B4B800255EA08ABA3C2F"><Descriptif>&lt;div&gt;Terminer l&amp;#039;exercice sur  l&amp;#039;équation différentielle linéaire d&amp;#039;ordre 2 d&amp;#039;un oscillateur harmonique .&lt;/div&gt;</Descriptif><PourLe>2022-03-07</PourLe></TravailAFaire></CahierDeTextes></PageCahierDeTextes><PageVieScolaire><Titre>Vie scolaire</Titre><Observation page="B4916D58F3246EEDF5B6C57FD61A18E97E3244D7DDC65D909663B8906A1D1B5E6C159B7CB55C268B12660D5E2B21CC39"><Date>2022-02-19T08:00:00</Date><Demandeur>M. COLLO O.</Demandeur><Matiere>SPE - PHYSIQUE-CHIMIE</Matiere><Observation>Dispensé(e) d\'AP le 19/2</Observation></Observation></PageVieScolaire><PagePronote page="A064210D32CDCC7A636F807151E66D0F4394CFA2CD7882C6EC22FF8EE93BF62F" nom="Page d\'accueil"/><PagePronote page="DEEFE0907DD6A9EBACFB1C6DADB5B814C73F555E7E272F6EC909CFF6A024AA6B" nom="Travail à faire à la maison"/><PagePronote page="8F58630EBD502FF16033D7568F0D42F2DDEFC5F46A64538AB612E370255B03C9" nom="Contenu et ressources pédagogiques"/><PagePronote page="C16AF6104CAE2CF131DFA304072B3824DAD5E24BBF1222B2A0254C1B5EA69E44" nom="Détail des notes"/><PagePronote page="BFAB90887F65912C42F74F304D736FCE44A72C2F8225080DD0A0D729DC4DE669" nom="Mon relevé de notes"/><PagePronote page="4B2F3D439677391BED155A549A71F2AF70547B4CDE9F910239A6610A0F39F7E5" nom="Bulletin de l\'élève"/><PagePronote page="76E6B06FC7F1466212834424E835421BC304827211607EC6ED8D9F3CA9562EB6" nom="Détail des évaluations"/><PagePronote page="D788475225004AE89B4B662475B2F533A108AA0EDEB6CF43CDF5C4472413018C" nom="Évaluations par compétence"/><PagePronote page="9EC6D9250824146E30F1A03243EE4259D29F66018F71CA90AC6D4E1596ADA7AE" nom="Bilan périodique de l\'élève"/><PagePronote page="B4916D58F3246EEDF5B6C57FD61A18E98F9754CEB1BB483CA9438F6A5A8542D5" nom="Récapitulatif des évènements de la vie scolaire"/></Eleve><PagePronote page="49A83A823848D2ABD80A30B82FEFA832223C5C6DB87C10A093919ED62103887E" nom="Niveaux de maitrise par matière"/><PageMessagerie><Titre>Messagerie</Titre><Discussions page="A2CA23E7B1634350133911009499746D"><NombreMessagesNonLus>0</NombreMessagesNonLus></Discussions><Informations page="CFC0BCED2CDD00E466FC2436F64DBC81"><NombreInformationsNonLus>12</NombreInformationsNonLus></Informations></PageMessagerie></Parent>',
        address: 'https://WSEducation.index-education.net/pronote',
      },
    ];
    const users = [
      ...children,
      {
        id: session.user.id,
        displayName: session.user.displayName,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
      },
    ];
    console.log('service - users', users);
    return carnetDeBordAdapter(data, users);
  },
};
