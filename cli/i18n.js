//
// i18n.js
//
// Automatically display required translation actions new translations
//
// Args:
//   - diff|unused to determine action type
//   - newTranslationsFile to declare path of new translations file
//

// As this is a cli tool, we disable some rules

const execSync = require('child_process').execSync;
const fs = require('fs');

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

  case 'unused':
    // Get unused keys
    getUnusedKeys();
    break;

  // Display error message
  default:
    console.error('!!! First argument should be "diff" or "unused" !!!');
    process.exit(1);
}
