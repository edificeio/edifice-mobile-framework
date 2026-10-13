import type { LegalUrls } from '~/modules/auth/model';

export interface RequirementTermsScreenTemplateProps {
  /** Legal documents of the platform. Their links are inactive until they are known. */
  legalUrls?: LegalUrls;
  /** The user accepts the terms. */
  onAccept: () => Promise<unknown>;
  /** The user refuses the terms. */
  onRefuse: () => Promise<unknown>;
  /** The user wants to read a legal document. */
  onOpenLegalUrl: (title: string, url: string) => void;
}
