import { IDistributionPosition, IForm } from '~/framework/modules/form/model';

export const getInitialPosition = (form: IForm): IDistributionPosition => {
  if (form.gdpr) return 'gdpr';
  if (form.description) return 'description';
  return 0;
};

export const getNextPosition = (prev: IDistributionPosition, form: IForm, elementCount: number): IDistributionPosition => {
  if (prev === 'gdpr') {
    return form.description ? 'description' : 0;
  }
  if (prev === 'description') {
    return 0;
  }
  return (prev as number) + 1 === elementCount ? 'summary' : (prev as number) + 1;
};
