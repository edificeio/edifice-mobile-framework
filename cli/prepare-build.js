//
// prepare-build.js
//
// Automatic build number generation
//
// Args:
//   - alpha|rc to prepare build number for alpha || rc
//   - major|minor|rev to prepare build number for new major || minor || rev version
//
// Update:
//   - package.json
//   - prepare-build.json
//   - android/app/build.gradle
//   - ios/appe/Info.plist'
//

// As this is a cli tool, we disable some rules
/* eslint-disable no-console */

const execSync = require('child_process').execSync;
const fs = require('fs');
const moment = require('moment');

const gradleFile = 'android/app/build.gradle';
const lastFile = 'cli/last-build.json';
const packageFile = 'package.json';
const plistFile = 'ios/appe/Info.plist';
const versionFile = 'cli/prepare-build.json';

//
// Check arguments
//

let buildType = process.argv.slice(2)[0];
if (!['alpha', 'rc', 'major', 'minor', 'rev'].includes(buildType)) {
  console.error('!!! Argument should be "alpha", "rc", "major", "minor" or "rev" !!!');
  process.exit(1);
}

console.info(`==> Will prepare ${buildType} build`);

//
// Read prepare-build.json
//

let versionContent = null;

try {
  versionContent = JSON.parse(fs.readFileSync(versionFile, 'utf-8'));
} catch (error) {
  console.error('!!! Unable to read prepare-build.json !!!');
  console.log(error);
  process.exit(2);
}

//
// Compute version && build number
//

let buildNumber = null;
let fullVersion = null;
let versionNumber = null;

try {
  if (['alpha', 'rc'].includes(buildType)) {
    versionContent.build += 1;
    versionContent[buildType] += 1;
    buildType = `${buildType}.${versionContent[buildType]}`;
  } else {
    switch (buildType) {
      case 'major':
        versionContent.major += 1;
        versionContent.minor = 0;
        versionContent.rev = 0;
        break;
      case 'minor':
        versionContent.minor += 1;
        versionContent.rev = 0;
        break;
      default:
        versionContent.rev += 1;
    }
    versionContent.alpha = 0;
    versionContent.build = 0;
    versionContent.rc = 0;
    buildType = '';
  }
  const major = versionContent.major;
  const minor = versionContent.minor;
  const rev = versionContent.rev;
  const build = versionContent.build;
  const type = buildType.length ? `-${buildType}` : '';
  // eslint-disable-next-line prettier/prettier
  buildNumber = `${major}${minor.toString().padStart(2, '0')}${rev.toString().padStart(2, '0')}${build
    .toString()
    .padStart(2, '0')}`;
  versionNumber = `${major}.${minor}.${rev}`;
  fullVersion = `${versionNumber}${type}(${buildNumber})`;
  console.info(`==> Version will be ${fullVersion})`);
} catch (error) {
  console.error('!!! Unable to compute build number !!!');
  console.log(error);
  process.exit(3);
}

//
// Write new content to prepare-build.json
//

try {
  fs.writeFileSync(versionFile, JSON.stringify(versionContent, null, 2), 'utf-8');
  console.info('==> prepare-build.json file updated');
} catch (error) {
  console.error('!!! Unable to write prepare-build.json !!!');
  console.log(error);
  process.exit(4);
}

//
// Read last-build.json
//

let lastContent = null;

try {
  lastContent = JSON.parse(fs.readFileSync(lastFile, 'utf-8'));
} catch (error) {
  console.error('!!! Unable to read last-build.json !!!');
  console.log(error);
  process.exit(5);
}

//
// Update release notes infos (last && notes) if needed
//

try {
  if (['alpha', 'rc'].includes(buildType)) {
    lastContent.notes = execSync(`git log --pretty=format:"%s" --since=${versionContent.last}`).toString();
    //.replace(/(\n)/g, '<br />');
    lastContent.last = moment().format('YYYY-MM-DDTHH:mm:ss');
  }
} catch (error) {
  console.error('!!! Unable to compute last build !!!');
  console.log(error);
  process.exit(7);
}

//
// Write new content to last-build.json
//

try {
  fs.writeFileSync(lastFile, JSON.stringify(lastContent, null, 2), 'utf-8');
  console.info('==> last-build.json file updated');
} catch (error) {
  console.error('!!! Unable to write last-build.json !!!');
  console.log(error);
  process.exit(8);
}

//
// Read Info.plist
//

let plistContent = null;

try {
  plistContent = fs.readFileSync(plistFile, 'utf-8');
} catch (error) {
  console.error('!!! Unable to read Info.plist !!!');
  console.log(error);
  process.exit(9);
}

//
// Change version && build number in IUnfo.plist content
//

try {
  plistContent = plistContent
    .replace(/(<key>CFBundleShortVersionString<\/key>\s*<string>)(.*)(<\/string>)/, '$1' + versionNumber + '$3')
    .replace(/(<key>CFBundleVersion<\/key>\s*<string>)(.*)(<\/string>)/, '$1' + buildNumber + '$3')
    .replace(/(<key>BundleVersionType<\/key>\s*<string>)(.*)(<\/string>)/, '$1' + buildType + '$3');
} catch (error) {
  console.error('!!! Unable to update Info.plist !!!');
  console.log(error);
  process.exit(10);
}

//
// Write Info.plist
//

try {
  fs.writeFileSync(plistFile, plistContent, 'utf-8');
  console.info('==> Info.plist file updated');
} catch (error) {
  console.error('!!! Unable to write Info.plist !!!');
  console.log(error);
  process.exit(11);
}

//
// Read build.gradle
//

let gradleContent = null;

try {
  gradleContent = fs.readFileSync(gradleFile, 'utf-8');
} catch (error) {
  console.error('!!! Unable to read build.gradle !!!');
  console.log(error);
  process.exit(12);
}

//
// Change version && build number in build.gradle content
//

try {
  gradleContent = gradleContent
    .replace(/(versionCode )(.*)/, '$1' + buildNumber)
    .replace(/(versionName ")(.*)(")/, '$1' + versionNumber + '$3')
    .replace(/(buildConfigField "String", "BundleVersionType", "\\")(.*)(\\"")/, '$1' + buildType + '$3');
} catch (error) {
  console.error('!!! Unable to update build.gradle !!!');
  console.log(error);
  process.exit(13);
}

//
// Write build.gradle
//

try {
  fs.writeFileSync(gradleFile, gradleContent, 'utf-8');
  console.info('==> build.gradle file updated');
} catch (error) {
  console.error('!!! Unable to write build.gradle !!!');
  console.log(error);
  process.exit(14);
}

//
// Read package.json
//

let packageContent = null;

try {
  packageContent = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
} catch (error) {
  console.error('!!! Unable to read package.json !!!');
  console.log(error);
  process.exit(15);
}

//
// Change version in package.json
//

try {
  packageContent.version = versionNumber;
} catch (error) {
  console.error('!!! Unable to update package.json !!!');
  console.log(error);
  process.exit(16);
}

//
// Write new content to prepare-build.json
//

try {
  fs.writeFileSync(packageFile, JSON.stringify(packageContent, null, 2), 'utf-8');
  console.info('==> package.json file updated');
} catch (error) {
  console.error('!!! Unable to write package.json !!!');
  console.log(error);
  process.exit(17);
}

//
// Commit && Push changes
//

try {
  execSync(`git add -A`);
  execSync(`git commit -m "release: ${fullVersion}"`);
  execSync('git push');
} catch (error) {
  console.error('!!! Unable to commit && push changes !!!');
  console.log(error);
  process.exit(18);
}
