import theme from '~/app/theme';

export type ResolvedAppIcon = { type: 'svg'; name: string } | { type: 'image'; uri: string } | { type: 'fallback' };

export function resolveAppIcon(app: { icon?: string; name: string }): ResolvedAppIcon {
  const icon = app.icon;

  if (icon?.startsWith('http') || icon?.startsWith('/workspace')) {
    return { type: 'image', uri: icon };
  }

  const themeKey = app.name.toLowerCase();
  const themeApp = theme.apps?.[themeKey as keyof typeof theme.apps];

  if (themeApp?.icon?.type === 'Svg') {
    return { name: themeApp.icon.name, type: 'svg' };
  }

  // 3️⃣ fallback
  return { type: 'fallback' };
}
