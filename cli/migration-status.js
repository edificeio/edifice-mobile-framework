/**
 * Computes the status of the migration to the new module system and writes docs/migrations/SUIVI.md.
 * Read-only on `src/`. Usage: `yarn migration-status` (add `--check` to fail when legacy counters went up).
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'docs/migrations/SUIVI.md');
const BASELINE = path.join(ROOT, 'docs/migrations/suivi.json');
const FLOWS_DIR = path.join(ROOT, '.maestro/flows');
const MODULES_DIRS = ['src/modules', 'src/framework/modules'];
// Folders of sub-modules: each sub-folder is a module of its own
const GROUPS = ['connectors', 'viescolaire', 'widgets'];
const SOURCE_FILE = /\.(ts|tsx|js|jsx)$/;

const PATTERNS = {
  connect: /[^a-zA-Z.]connect\(/,
  legacyDeclaration: /new NavigableModule\(/,
  legacyNavigation: /createModuleNavigator|~\/app\/navigation['/]|NativeStackScreenProps|navigation\.setOptions/,
  legacyScreen: /<Stack\.Screen/g,
  newDeclaration: /new (Ent|Core)Module\(/,
  newScreen: /define(Screen|Modal)\(/,
};

const listFiles = dir =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full);
    return SOURCE_FILE.test(entry.name) ? [full] : [];
  });

const listModules = () =>
  MODULES_DIRS.flatMap(base =>
    fs
      .readdirSync(path.join(ROOT, base), { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .flatMap(entry => {
        if (!GROUPS.includes(entry.name)) return [`${base}/${entry.name}`];
        return fs
          .readdirSync(path.join(ROOT, base, entry.name), { withFileTypes: true })
          .filter(sub => sub.isDirectory())
          .map(sub => `${base}/${entry.name}/${sub.name}`);
      }),
  );

const readModule = dir => {
  const files = listFiles(path.join(ROOT, dir)).map(file => ({ content: fs.readFileSync(file, 'utf8'), file }));
  const count = pattern => files.filter(({ content }) => pattern.test(content)).length;
  const imports = new Set();
  files.forEach(({ content }) => {
    for (const match of content.matchAll(/from '~\/((?:framework\/)?modules\/[^']+)'/g)) imports.add(`src/${match[1]}`);
  });
  return {
    connect: count(PATTERNS.connect),
    dir,
    files: files.length,
    imports: [...imports],
    legacyDeclaration: count(PATTERNS.legacyDeclaration) > 0,
    legacyNavigation: count(PATTERNS.legacyNavigation),
    legacyScreens: files.reduce((sum, { content }) => sum + (content.match(PATTERNS.legacyScreen) ?? []).length, 0),
    lines: files.reduce((sum, { content }) => sum + content.split('\n').length, 0),
    name: dir.replace(/^src\/(framework\/)?modules\//, ''),
    newDeclaration: count(PATTERNS.newDeclaration) > 0,
    newScreens: count(PATTERNS.newScreen),
    notifHandler: files.some(({ file }) => file.includes('notif-handler')),
  };
};

const generationOf = module => {
  if (module.legacyDeclaration) return 'ancienne';
  if (module.newDeclaration) return 'nouvelle';
  return '—';
};

const loadedModules = () => {
  const config = fs.readFileSync(path.join(ROOT, 'src/app/config/modules.ts'), 'utf8');
  return config
    .split('\n')
    .filter(line => !line.trim().startsWith('//'))
    .flatMap(line => [...line.matchAll(/import\('~\/([^']+)'\)/g)].map(match => `src/${match[1]}`));
};

const countFlows = name => {
  if (!fs.existsSync(FLOWS_DIR)) return 0;
  const prefix = `${name.replace(/\//g, '-')}-`;
  return fs.readdirSync(FLOWS_DIR).filter(file => file.startsWith(prefix) && /\.ya?ml$/.test(file)).length;
};

const modules = listModules().map(readModule);
const loaded = loadedModules();
const legacyDirs = modules.filter(module => generationOf(module) === 'ancienne').map(module => module.dir);
// The module a path belongs to: the deepest module folder that contains it
const moduleOf = file =>
  modules
    .map(module => module.dir)
    .filter(dir => file === dir || file.startsWith(`${dir}/`))
    .sort((a, b) => b.length - a.length)[0];

const rows = modules.map(module => {
  const generation = generationOf(module);
  // Legacy modules this one still imports: they are not loaded by the app
  const legacyImports = module.imports
    .map(moduleOf)
    .filter(dir => dir && dir !== module.dir && legacyDirs.includes(dir))
    .map(dir => dir.replace(/^src\/(framework\/)?modules\//, ''));
  const flows = countFlows(module.name);
  const isLoaded = loaded.includes(module.dir);
  let status = '—';
  if (generation === 'ancienne') status = 'à faire';
  else if (generation === 'nouvelle') {
    if (!isLoaded) status = 'non chargé';
    else if (module.legacyNavigation > 0 || legacyImports.length > 0) status = 'bascule incomplète';
    else if (flows === 0) status = 'basculé, sans test';
    else status = 'basculé, testable';
  }
  return { ...module, flows, generation, isLoaded, legacyImports: [...new Set(legacyImports)].sort(), status };
});

const declared = rows.filter(row => row.generation !== '—');
const legacy = rows.filter(row => row.generation === 'ancienne');
const totals = {
  connect: rows.reduce((sum, row) => sum + row.connect, 0),
  legacyLines: legacy.reduce((sum, row) => sum + row.lines, 0),
  legacyModules: legacy.length,
  legacyNavigation: rows.reduce((sum, row) => sum + row.legacyNavigation, 0),
  legacyScreens: rows.reduce((sum, row) => sum + row.legacyScreens, 0),
};

const git = command => {
  try {
    return execSync(`git ${command}`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '?';
  }
};

const table = (title, list) =>
  [
    `## ${title}`,
    '',
    '| Module | Statut | Fichiers | Lignes | Écrans anciens | Écrans nouveaux | Navigation ancienne | `connect(` | Modules anciens importés | Notif. | Flows |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | :---: | ---: |',
    ...list.map(
      row =>
        `| \`${row.name}\` | ${row.status} | ${row.files} | ${row.lines} | ${row.legacyScreens} | ${row.newScreens} | ${row.legacyNavigation} | ${row.connect} | ${row.legacyImports.map(name => `\`${name}\``).join(', ') || '—'} | ${row.notifHandler ? 'oui' : '—'} | ${row.flows} |`,
    ),
    '',
  ].join('\n');

const done = declared.length - legacy.length;
const markdown = [
  '# Suivi calculé de la migration',
  '',
  `> Généré par \`yarn migration-status\` le ${new Date().toISOString().slice(0, 10)}, branche \`${git('rev-parse --abbrev-ref HEAD')}\`, commit \`${git('rev-parse --short HEAD')}\`. **Ne pas modifier à la main** : relancer la commande. Le contexte et les décisions sont dans [STATUS.md](STATUS.md) ; le sens des colonnes est en bas de page.`,
  '',
  '## En bref',
  '',
  '| Indicateur | Valeur |',
  '| --- | ---: |',
  `| Modules sur la nouvelle génération | ${done} / ${declared.length} |`,
  `| Modules restant sur l'ancienne | ${totals.legacyModules} |`,
  `| Lignes dans les modules anciens | ${totals.legacyLines} |`,
  `| Écrans anciens à porter (\`<Stack.Screen>\`) | ${totals.legacyScreens} |`,
  `| Fichiers sur l'ancienne navigation | ${totals.legacyNavigation} |`,
  `| Fichiers avec \`connect(\` | ${totals.connect} |`,
  '',
  table(
    'Modules sur la nouvelle génération',
    rows.filter(row => row.generation === 'nouvelle'),
  ),
  table(
    "Modules sur l'ancienne génération",
    legacy.sort((a, b) => a.lines - b.lines),
  ),
  table(
    'Dossiers sans déclaration de module',
    rows.filter(row => row.generation === '—'),
  ),
  '## Lire ce tableau',
  '',
  '- **Statut** : `à faire` (déclaré en `NavigableModule`) · `non chargé` (nouvelle déclaration, absent de `src/app/config/modules.ts`) · `bascule incomplète` (il reste de la navigation ancienne ou un import de module ancien) · `basculé, sans test` · `basculé, testable` (au moins un flow Maestro). Le statut ne dit pas que le module a été joué dans l’app : cela se note dans sa fiche.',
  '- **Écrans anciens** : nombre de `<Stack.Screen>`. **Écrans nouveaux** : fichiers avec `defineScreen(` ou `defineModal(`.',
  '- **Navigation ancienne** : fichiers avec `createModuleNavigator`, un import de `~/app/navigation`, `NativeStackScreenProps` ou `navigation.setOptions`.',
  '- **Modules anciens importés** : modules encore en `NavigableModule` que ce module importe. L’app ne les charge pas : leur code s’exécute sans leur reducer ni leur initialisation.',
  '- **Notif.** : le module a un `notif-handler`, sans équivalent dans le nouveau système pour l’instant.',
  '- **Flows** : fichiers `.maestro/flows/<module>-*.yaml`.',
  '- Les modules anciens sont triés du plus petit au plus gros.',
  '',
].join('\n');

if (process.argv.includes('--check')) {
  if (!fs.existsSync(BASELINE)) {
    console.error('No baseline: run `yarn migration-status` first.');
    process.exit(1);
  }
  const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  const regressions = Object.keys(totals).filter(key => totals[key] > baseline[key]);
  regressions.forEach(key => console.error(`${key}: ${baseline[key]} -> ${totals[key]}`));
  if (regressions.length) {
    console.error('Legacy counters went up: new code must use the new module system (see docs/migrations/INTENT.md).');
    process.exit(1);
  }
  console.log('Legacy counters did not go up.');
} else {
  fs.writeFileSync(OUTPUT, markdown);
  fs.writeFileSync(BASELINE, `${JSON.stringify(totals, null, 2)}\n`);
  console.log(`${done} / ${declared.length} modules on the new system, ${totals.legacyScreens} legacy screens left.`);
  console.log(`Written: ${path.relative(ROOT, OUTPUT)}`);
}
