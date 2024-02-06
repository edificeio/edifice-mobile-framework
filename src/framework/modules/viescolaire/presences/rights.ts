/**
 * Presences workflow
 */
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import appConf from '~/framework/util/appConf';

export const createAbsenceStatementsRight = 'fr.openent.presences.controller.FakeRight|AbsenceStatementsCreate';
export const managePresencesRight = 'fr.openent.presences.controller.FakeRight|managePresences';
export const presences1dRight = 'fr.openent.presences.controller.FakeRight|presences1D';
export const presences2dRight = 'fr.openent.presences.controller.FakeRight|presences2D'; // does not exist yet

export const getPresencesWorkflowInformation = (session: AuthLoggedAccount) => ({
  createAbsenceStatements: session.rights.authorizedActions.some(a => a.name === createAbsenceStatementsRight),
  managePresences: session.rights.authorizedActions.some(a => a.name === managePresencesRight),
  presences1d: session.rights.authorizedActions.some(a => a.name === presences1dRight),
  //presences2d: session.authorizedActions.some(a => a.name === presences2dRight),
  presences2d: appConf.is2d, // temporary checking platform level until presences2d right is created and assigned
});
