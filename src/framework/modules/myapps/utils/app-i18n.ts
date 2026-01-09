import { I18n } from '~/app/i18n';
import { AppsInfo } from '~/framework/modules/myapps/types.ts';

const PREFIX_ALIAS_MAP: Record<string, string> = {
  actualites: 'news',
  conversation: 'messagerie',
  diary: 'homeworks',
};

function normalizePrefix(prefix?: string): string | null {
  if (!prefix) return null;
  return prefix.replace(/^\//, '').toLowerCase();
}

export default function getAppI18nLabel(app: Pick<AppsInfo, 'prefix' | 'displayName' | 'name'>): string {
  const prefixKey = normalizePrefix(app.prefix);

  if (prefixKey) {
    const resolvedKey = PREFIX_ALIAS_MAP[prefixKey] ?? prefixKey;
    const i18nKey = `timeline-apptype-${resolvedKey}`;
    const translated = I18n.get(i18nKey);

    if (translated !== i18nKey) {
      return translated;
    }
  }

  return app.displayName ?? app.name;
}
