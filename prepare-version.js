//
// prepare-version.js
//
// Prepare sources for new version
//
// Args:
//  - major minor rev specify new version number || major|minor|rev 
//

const execSync = require('child_process').execSync;
const fs = require('fs');

const gradleFile = 'android/app/build.gradle';
const packageFile = './package.json';
const plistFile = 'ios/appe/Info.plist';
const versionFile = './version.json';

//
// Check arguments
//

const versionComponents = process.argv.slice(2);

if (((versionComponents.length !== 1)) || (versionComponents.length !== 3)) {
  console.error('!!! Arguments should be major + minor + rev || major|minor|rev !!!');
  process.exit(1);
}

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
  let major = versionContent.major;
  let minor = versionContent.minor;
  let rev = versionContent.rev;
  switch (versionComponents[0]) {
    case 'major':
      major = versionContent.major + 1;
      minor = 0;
      rev = 0;
      break;
    case 'minor':
      minor = versionContent.minor + 1;
      rev = 0;
      break;
    case 'rev':
      rev = versionContent.rev + 1;
      break;
    default:
      major = parseInt(versionComponents[0], 10);
      minor = parseInt(versionComponents[1], 10);
      rev = parseInt(versionComponents[2], 10);
  }
  versionNumber = `${major}.${minor}.${rev}`;
  versionContent.major = major;
  versionContent.minor = minor;
  versionContent.rev = rev;
  versionContent.build = 0;
  versionContent.alpha = 0;
  versionContent.rc = 0;
  buildNumber = `${major}${minor.toString().padStart(2, '0')}${rev.toString().padStart(2, '0')}${(0).toString().padStart(2, '0')}`;
  fullVersion = `${versionNumber} (${buildNumber})`;
  console.info(`==> Version will be ${fullVersion}`);
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
    .replace(/(<key>BundleVersionType<\/key>\s*<string>)(.*)(<\/string>)/, '$1$3');
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
// Read package.json
//

let packageContent = null;

try {
  packageContent = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
} catch (error) {
  console.error('!!! Unable to read package.json !!!');
  console.log(error);
  process.exit(11);
}

//
// Compute version && build number
//

try {
  packageContent.version = versionNumber;
} catch (error) {
  console.error('!!! Unable to update package.json !!!');
  console.log(error);
  process.exit(12);
}

//
// Write new content to version.json
//

try {
  fs.writeFileSync(packageFile, JSON.stringify(packageContent, null, 2), 'utf-8');
  console.info('==> package.json file updated');
} catch (error) {
  console.error('!!! Unable to write package.json !!!');
  console.log(error);
  process.exit(13);
}

//
// Commit && Push changes
//
try {
  execSync(`git add ${gradleFile}`);
  execSync(`git add ${packageFile}`);
  execSync(`git add ${plistFile}`);
  execSync(`git add ${versionFile}`);
  execSync(`git commit -m "release: ${fullVersion}"`);
  execSync('git push');
} catch (error) {
  console.error('!!! Unable to commit && push changes !!!');
  console.log(error);
  process.exit(11);
}
