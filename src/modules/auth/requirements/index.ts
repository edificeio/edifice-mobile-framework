/**
 * Requirements module
 * This module is **private**: it is not part of the global modules, only the root stack includes it, in its own group
 * (`RequirementScreens`), shown while the connected account has a requirement to fulfill.
 *
 * A requirement is something the platform asks the user before the app can be used (new terms, new password...).
 * The account is already signed in at this point, see `flows/index.ts` for the lifecycle.
 *
 * ## Which screen is shown
 * Each screen is only available for its own requirement (`if`), and the platform gives only one requirement at a time:
 * there is always one screen at most. When it is done, `refreshRequirements` checks again and the next requirement's screen
 * (or the app) shows up by itself. So THE ORDER BETWEEN REQUIREMENTS DOES NOT MATTER.
 * (The order in which requirements are asked is decided by the service, see `requirements.getNextNeeded`.)
 *
 * ## The only order that matters: a requirement's first screen comes first
 * A requirement can have follow-up screens that are reached by navigation (the "type the code" screen after "verify email").
 * They all share the same `if`, so the router starts on the FIRST available one in the object: the entry screen of the
 * requirement must be declared before its follow-ups. Keys are sorted alphabetically (eslint), hence the naming:
 * the entry screen's name is the prefix of its follow-ups' (`verify-email` < `verify-email-code`).
 */

import { CoreModule } from '~/app/module';
import { AuthRequirement } from '~/modules/auth/model';
import { useAccountWithRequirement } from '~/modules/auth/store/accounts';

import RequirementResetPasswordScreen from './screens/reset-password';
import RequirementTermsScreen from './screens/terms';
import RequirementVerifyEmailScreen from './screens/verify-email';
import RequirementVerifyEmailCodeScreen from './screens/verify-email-code';
import RequirementVerifyMobileScreen from './screens/verify-mobile';
import RequirementVerifyMobileCodeScreen from './screens/verify-mobile-code';

/** Builds the `if` of a screen: available only while the requirement of the connected account is one of the given. */
const forRequirement =
  (...requirements: AuthRequirement[]) =>
  () => {
    const requirement = useAccountWithRequirement()?.requirement;
    return requirement !== undefined && requirements.includes(requirement);
  };

export default new CoreModule({
  modals: {},
  name: 'requirements',
  screens: {
    'requirements/reset-password': {
      ...RequirementResetPasswordScreen,
      if: forRequirement(AuthRequirement.MUST_CHANGE_PASSWORD),
    },
    'requirements/terms': {
      ...RequirementTermsScreen,
      if: forRequirement(AuthRequirement.MUST_REVALIDATE_TERMS, AuthRequirement.MUST_VALIDATE_TERMS),
    },
    'requirements/verify-email': {
      ...RequirementVerifyEmailScreen,
      if: forRequirement(AuthRequirement.MUST_VERIFY_EMAIL),
    },
    // Follow-up of `verify-email`: reached by navigation, not by itself (see the note about the order above).
    'requirements/verify-email-code': {
      ...RequirementVerifyEmailCodeScreen,
      if: forRequirement(AuthRequirement.MUST_VERIFY_EMAIL),
    },
    'requirements/verify-mobile': {
      ...RequirementVerifyMobileScreen,
      if: forRequirement(AuthRequirement.MUST_VERIFY_MOBILE),
    },
    // Follow-up of `verify-mobile`: reached by navigation, not by itself (see the note about the order above).
    'requirements/verify-mobile-code': {
      ...RequirementVerifyMobileCodeScreen,
      if: forRequirement(AuthRequirement.MUST_VERIFY_MOBILE),
    },
  },
});
