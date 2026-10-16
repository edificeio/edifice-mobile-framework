/**
 * Compatibility layer of the former auth service.
 * The service now lives in `~/modules/auth/service`, kept here for the not yet migrated modules.
 *
 * @deprecated use `import service from '~/modules/auth/service'` (types in `~/modules/auth/service/types`).
 */

import service from '~/modules/auth/service';

export type {
  IEntcoreEmailValidationInfos,
  IEntcoreEmailValidationState,
  IEntcoreMFAValidationInfos,
  IEntcoreMFAValidationState,
  IEntcoreMobileValidationInfos,
  IEntcoreMobileValidationState,
  IUserRequirements,
} from '~/modules/auth/service/types';

/** @deprecated use `service.emailValidation`. */
export const emailValidation = service.emailValidation;

/** @deprecated use `service.mfaValidation`. */
export const mfaValidation = service.mfaValidation;

/** @deprecated use `service.mobileValidation`. */
export const mobileValidation = service.mobileValidation;

/** @deprecated use `service.platformConfig`. */
export const platformConfig = service.platformConfig;

/** @deprecated use `service.requirements`. */
export const requirements = service.requirements;
