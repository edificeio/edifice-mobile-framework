/**
 * Utility cli that use scaffolder-cli to generate code
 */
const { fork } = require('child_process');
const process = require('process');

function cmd(...command) {
  const p = fork(command[0], command.slice(1), { env: { ...process.env, FORCE_COLOR: '1' }, stdio: 'pipe' });
  return new Promise((resolve, reject) => {
    p.stdout.on('data', x => {
      process.stdout.write(x);
      // Need to search for "Error" in stdout because of how scaffolder-cli 'not' manage errors...
      if (x.toString().includes('Error')) {
        reject(new Error(x.toString()));
      }
    });
    p.stderr.on('data', x => {
      process.stderr.write(x);
      reject(new Error(x.toString()));
    });
    p.on('exit', code => {
      if (code !== 0) {
        reject(new Error(code));
      }
      resolve(code);
    });
  });
}

async function useScaffoldModule(template, vars) {
  const varsArray = Object.entries(vars).map(([k, v]) => `${k}=${v}`);
  await cmd(
    'node_modules/scaffolder-cli/dist/index.js',
    'create',
    template,
    '--path-prefix',
    '/src/framework/modules',
    '-f',
    vars.moduleName,
    ...varsArray,
  );
}

async function useScaffoldScreen(template, vars) {
  const varsArray = Object.entries(vars).map(([k, v]) => `${k}=${v}`);
  await cmd(
    'node_modules/scaffolder-cli/dist/index.js',
    'create',
    template,
    '--path-prefix',
    `/src/framework/modules/${vars.moduleName}/screens`,
    '-f',
    vars.screenName,
    ...varsArray,
  );
}

function moduleCommandYargs(command, help) {
  return [
    `${command} <module-name>`,
    help,
    yargs => {
      yargs.positional('moduleName', {
        type: 'string',
        describe: 'what module name to create. Use kebab-case.',
      });
    },
    async function (argv) {
      try {
        await useScaffoldModule(command, { moduleName: argv.moduleName });

        console.info(
          `\x1b[32mModule \`${argv.moduleName}\` created. You have to add it manually to the overrides to make it visible in the app. \x1b[0m`,
        );
        console.info(`\x1b[32mCopy the following line in \`modules.ts\` file of the desired overrides: (sort it lexically)\x1b[0m`);
        console.info(`\x1b[1m\x1b[35m\n  require("~/framework/modules/${argv.moduleName}"),\n\x1b[0m`);
      } catch {
        console.error(`\x1b[1m\x1b[31mAn error has occured. See the error message above. \n\x1b[0m`);
      }
    },
  ];
}

function screenCommandYargs(command, help) {
  return [
    `${command} <module-name> <screen-name>`,
    help,
    yargs => {
      yargs.positional('moduleName', {
        type: 'string',
        describe: 'what module name the new screen belongs to. Use kebab-case.',
      });
      yargs.positional('screenName', {
        type: 'string',
        describe: 'what module screen to create. Use kebab-case.',
      });
    },
    async function (argv) {
      try {
        await useScaffoldScreen(command, { moduleName: argv.moduleName, screenName: argv.screenName });

        console.info(
          `\x1b[32mScreen \`${argv.screenName}\` created in module \`${argv.moduleName}\`. You have to add it manually to the module navigation to make it visible in the app. \x1b[0m`,
        );
        console.info(
          `\x1b[1m\x1b[32mFollow the instructions in \`src/framework/modules/${argv.moduleName}/screens/${argv.screenName}/index.ts\` file.\n\x1b[0m`,
        );
      } catch {
        console.error(`\x1b[1m\x1b[31mAn error has occured. See the error message above. \n\x1b[0m`);
      }
    },
  ];
}

/**
 * Main script.
 * Parse command args & execute
 */
const main = () => {
  // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
  require('yargs')
    .showHelpOnFail(true, 'Specify --help for available options')
    .scriptName('scaffold')
    .command(...moduleCommandYargs('module-tab', 'Generates module <module-name> that will be displyed in the tab bar.'))
    .command(
      ...moduleCommandYargs(
        'module-tab-redux',
        'Generates module <module-name> with redux integration that will be displyed in the tab bar.',
      ),
    )
    .command(...moduleCommandYargs('module-myapps', 'Generates module <module-name> that will be displyed in My Apps screen.'))
    .command(
      ...moduleCommandYargs(
        'module-myapps-redux',
        'Generates module <module-name> with redux integration that will be displyed in My Apps screen.',
      ),
    )
    .command(...screenCommandYargs('screen', 'Generates screen <screen-name> in module <module-name>.'))
    .command(
      ...screenCommandYargs('screen-redux', 'Generates screen <screen-name> in module <module-name> with redux integration.'),
    )
    .help()
    .demandCommand().argv;
};

main();
