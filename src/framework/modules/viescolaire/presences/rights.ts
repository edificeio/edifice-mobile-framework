/**
 * Presences workflow
 */
import { ISession } from '~/framework/modules/auth/model';
import appConf from '~/framework/util/appConf';

export const createAbsenceStatementsRight = 'fr.openent.presences.controller.FakeRight|AbsenceStatementsCreate';
export const managePresencesRight = 'fr.openent.presences.controller.FakeRight|managePresences';
export const presences1dRight = 'fr.openent.presences.controller.FakeRight|presences1D';
export const presences2dRight = 'fr.openent.presences.controller.FakeRight|presences2D';

export const getPresencesWorkflowInformation = (session: ISession) => ({
  createAbsenceStatements: session.authorizedActions.some(a => a.name === createAbsenceStatementsRight),
  managePresences: session.authorizedActions.some(a => a.name === managePresencesRight),
  presences1d: session.authorizedActions.some(a => a.name === presences1dRight),
  presences2d: session.authorizedActions.some(a => a.name === presences2dRight) || appConf.is2d, // temporary checking platform level until new rights are set on all platforms
});
