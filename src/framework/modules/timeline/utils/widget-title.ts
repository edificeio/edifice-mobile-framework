import { I18n } from '~/app/i18n';
import { IEntcoreWidget } from '~/framework/util/moduleTool';

export const getWidgetTitle = (widget: IEntcoreWidget): string => {
  // extract widget name without "-widget" suffix
  const widgetName = widget.name.replace(/-widget$/, '');
  const i18nKey = `widget-${widgetName}-title`;
  return I18n.get(i18nKey);
};
