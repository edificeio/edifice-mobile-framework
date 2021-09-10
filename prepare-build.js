//
// prepare-build.js
//
// Automatic build number generation
//
// Args:
//  - alpha|rc to prepare build number for alpha || rc
//

const execSync = require('child_process').execSync;
const fs = require('fs');

const gradleFile = 'android/app/build.gradle';
const plistFile = 'ios/appe/Info.plist';
const versionFile = './version.json';

//
// Check arguments
//

let buildType = process.argv.slice(2)[0];
if (!['alpha', 'rc'].includes(buildType)) {
  console.error('!!! Argument should be "alpha" or "rc" !!!');
  process.exit(1);
}

console.info(`==> Will prepare ${buildType} build`);

//
// Read version.json
//

let versionContent = null;

try {
  versionContent = JSON.parse(fs.readFileSync(versionFile, 'utf-8'));
} catch (error) {
  console.error('!!! Unable to read version.json !!!');
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
  versionContent.build += 1;
  versionContent[buildType] += 1;
  buildType += `.${versionContent[buildType]}`;
  const major = versionContent.major;
  const minor = versionContent.minor;
  const rev = versionContent.rev;
  const build = versionContent.build;
  // eslint-disable-next-line prettier/prettier
  buildNumber = `${major}${minor.toString().padStart(2, '0')}${rev.toString().padStart(2, '0')}${build
    .toString()
    .padStart(2, '0')}`;
  versionNumber = `${major}.${minor}.${rev}`;
  fullVersion = `${versionNumber}-${buildType} (${buildNumber})`;
  console.info(`==> Version will be ${fullVersion})`);
} catch (error) {
  console.error('!!! Unable to compute build number !!!');
  console.log(error);
  process.exit(3);
}

//
// Write new content to version.json
//

try {
  fs.writeFileSync(versionFile, JSON.stringify(versionContent, null, 2), 'utf-8');
  console.info('==> version.json file updated');
} catch (error) {
  console.error('!!! Unable to write version.json !!!');
  console.log(error);
  process.exit(4);
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
  process.exit(5);
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
  process.exit(6);
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
  process.exit(7);
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
  process.exit(8);
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
  process.exit(9);
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
  process.exit(10);
}

//
// Commit && Push changes
//
try {
  execSync(`git add ${gradleFile}`);
  execSync(`git add ${plistFile}`);
  execSync(`git add ${versionFile}`);
  execSync(`git commit "-m release: ${fullVersion}"`);
  execSync('git push');
} catch (error) {
  console.error('!!! Unable to commit && push changes !!!');
  console.log(error);
  process.exit(11);
}
