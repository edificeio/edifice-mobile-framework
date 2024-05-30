//
// i18n.js
//
// Automatically display required translation actions or merge new translations
//
// Args:
//   - diff|merge to determine action type
//   - fr|en|es to merge new translations into fr.json || en.json || es.json
//   - newTranslationsFile to declare path of new translations file
//
// Update (merge):
//   - fr.json, en.json or es.json
//

// As this is a cli tool, we disable some rules
/* eslint-disable no-case-declarations */

const execSync = require('child_process').execSync;
const fs = require('fs');

const lastFile = 'cli/last-build.json';

/**
 * Verify if object is empty.
 * @param object object being verified
 */
// from https://www.samanthaming.com/tidbits/94-how-to-check-if-object-is-empty
const isObjectEmpty = object => {
  return object && Object.keys(object).length === 0 && object.constructor === Object;
};

/**
 * Get keys difference between two objects.
 * @param object1 base object
 * @param object2 compared object
 */
const getKeysDifference = (object1, object2) => {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  const extraKeysObject1 = {};
  const extraKeysObject2 = {};
  for (const key of keys1) {
    if (!keys2.includes(key)) extraKeysObject1[key] = object1[key];
  }
  for (const key of keys2) {
    if (!keys1.includes(key)) extraKeysObject2[key] = object2[key];
  }
  return { extraKeysObject1, extraKeysObject2 };
};

/**
 * Check if two objects are equal.
 * @param object1 base object
 * @param object2 compared object
 */
// from https://dmitripavlutin.com/how-to-compare-objects-in-javascript
const shallowEqual = (object1, object2) => {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (object1[key] !== object2[key]) {
      return false;
    }
  }
  return true;
};

/**
 * Get path of local translations JSON file (based on language).
 * @param language language of local translations JSON file
 */
const getLocalFile = language => {
  return `assets/i18n/${language}.json`;
};

/**
 * Compare fr.json keys with those of en.json and es.json.
 * Display translation actions required before releasing a new version:
 * -new french keys to translate into english & spanish
 * -unused english & spanish keys to delete (not present in fr.json)
 * -a reminder to manually verify & update the "mobileapp-config" repository
 */
const getTranslationActions = () => {
  console.info('==> Will display translation actions');

  //
  // Read local translations files
  //

  let localFrContent = null;
  let localEnContent = null;
  let localEsContent = null;

  try {
    localFrContent = JSON.parse(fs.readFileSync(getLocalFile('fr'), 'utf-8'));
    localEnContent = JSON.parse(fs.readFileSync(getLocalFile('en'), 'utf-8'));
    localEsContent = JSON.parse(fs.readFileSync(getLocalFile('es'), 'utf-8'));
  } catch (error) {
    console.error('!!! Unable to read fr.json, en.json or es.json !!!');
    process.exit(2);
  }

  //
  // Display translation actions
  //

  const displayObject = object => (isObjectEmpty(object) ? '✅' : object);
  const frEnDiff = getKeysDifference(localFrContent, localEnContent);
  const frEsDiff = getKeysDifference(localFrContent, localEsContent);
  const areTranslateValuesEqual = shallowEqual(frEnDiff.extraKeysObject1, frEsDiff.extraKeysObject1);
  const areDeleteValuesEqual = shallowEqual(frEnDiff.extraKeysObject2, frEsDiff.extraKeysObject2);
  const translationActions = {
    translate: areTranslateValuesEqual
      ? displayObject(frEnDiff.extraKeysObject1)
      : {
          english: displayObject(frEnDiff.extraKeysObject1),
          spanish: displayObject(frEsDiff.extraKeysObject1),
        },
    delete: areDeleteValuesEqual
      ? displayObject(frEnDiff.extraKeysObject2)
      : {
          english: displayObject(frEnDiff.extraKeysObject2),
          spanish: displayObject(frEsDiff.extraKeysObject2),
        },
    mobileappConfigRepository: '🔎 Verify & update manually',
  };
  console.log(translationActions);
};

/**
 * Add new translation keys located within an external JSON file to the local JSON file of the same language.
 * New keys are inserted alphabetically.
 * Changes are commited and pushed to GitHub.
 * @param language language of local JSON file to merge new translations into
 * @param newTranslationsFile path of external JSON file containing the new translations
 */
const mergeNewTranslations = (language, newTranslationsFile) => {
  const localTranslationsFile = getLocalFile(language);

  console.info(`==> Will merge new translations from ${newTranslationsFile} into ${localTranslationsFile}`);

  //
  // Read local translations
  //

  let localTranslationsContent = null;

  try {
    localTranslationsContent = JSON.parse(fs.readFileSync(localTranslationsFile, 'utf-8'));
  } catch (error) {
    console.error(`!!! Unable to read ${localTranslationsFile} !!!`);
    console.log(error);
    process.exit(5);
  }

  //
  // Read new translations
  //

  let newTranslationsContent = null;

  try {
    newTranslationsContent = JSON.parse(fs.readFileSync(newTranslationsFile, 'utf-8'));
  } catch (error) {
    console.error(`!!! Unable to read ${newTranslationsFile} !!!`);
    console.log(error);
    process.exit(6);
  }

  //
  // Update translations
  //

  try {
    // Merge
    localTranslationsContent = { ...localTranslationsContent, ...newTranslationsContent };

    // Sort alphabetically
    localTranslationsContent = Object.keys(localTranslationsContent)
      .sort()
      .reduce(
        (acc, key) => ({
          ...acc,
          [key]: localTranslationsContent[key],
        }),
        {},
      );
  } catch (error) {
    console.error('!!! Unable to update translations !!!');
    console.log(error);
    process.exit(7);
  }

  //
  // Write new translations
  //

  try {
    fs.writeFileSync(localTranslationsFile, JSON.stringify(localTranslationsContent, null, 2), 'utf-8');
    console.info(`==> ${localTranslationsFile} updated`);
  } catch (error) {
    console.error(`!!! Unable to update ${localTranslationsFile} !!!`);
    console.log(error);
    process.exit(8);
  }

  //
  // Read prepare-build.json & compute version number
  //

  let lastContent = null;
  let lastVersion = null;

  try {
    lastContent = JSON.parse(fs.readFileSync(lastFile, 'utf-8'));
    lastVersion = lastContent.version;
  } catch (error) {
    console.error('!!! Unable to read last-build.json !!!');
    console.log(error);
    process.exit(9);
  }

  //
  // Commit && Push changes
  //

  try {
    execSync(`git add -A`);
    execSync(`git commit -m "translations (${lastVersion}): ${language}.json"`);
    execSync('git push');
  } catch (error) {
    console.error('!!! Unable to commit && push changes !!!');
    console.log(error);
    process.exit(10);
  }
};

/**
 * Display unsused keys
 */
const getUnusedKeys = () => {
  try {
    console.info('==> Unused keys:');
    const keys = Object.keys(JSON.parse(fs.readFileSync(getLocalFile('fr'), 'utf-8')));
    let unused = 0;
    keys.forEach(key => {
      const result = execSync(`grep --recursive "${key}" ./src | wc -l`).toString().trim();
      if (result === '0') {
        unused++;
        console.log(key);
      }
    });
    console.info(`==> Unused : ${unused} / ${keys.length}`);
  } catch (error) {
    console.error(`!!! Unable display unused keys !!!`);
    console.log(error);
    process.exit(11);
  }
};

//
// Launch translations process
//

const actionType = process.argv.slice(2)[0];

switch (actionType) {
  case 'diff':
    // Process diff
    getTranslationActions();
    break;

  case 'merge':
    // Get & check language
    const language = process.argv.slice(2)[1];
    if (!['en', 'es', 'fr', 'it'].includes(language)) {
      console.error('!!! Second argument should be "en", "es", "fr" or "it" !!!');
      process.exit(3);
    }
    // Get & check newTranslationsFile
    const newTranslationsFile = process.argv.slice(2)[2];
    if (!newTranslationsFile) {
      console.error('!!! Third argument newTranslationsFile missing !!!');
      process.exit(4);
    }
    // Process merge
    mergeNewTranslations(language, newTranslationsFile);
    break;

  case 'unused':
    // Get unused keys
    getUnusedKeys();
    break;

  // Display error message
  default:
    console.error('!!! First argument should be "diff", "merge" or "unused" !!!');
    process.exit(1);
}
