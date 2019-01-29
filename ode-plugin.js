const util = require('util');
const fs = require('fs');
const path = require("path");
const os = require("os");
//external deps
const yargs = require('yargs');
const prompts = require('prompts');
//
const exec = util.promisify(require('child_process').exec);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const copyFile = util.promisify(fs.copyFile);
const unlinkFile = util.promisify(fs.unlink);

/**
 * Create target dir with its parents (if they not exists)
 */
function _mkdirsSync(targetDir, { isRelativeToScript = false } = {}) {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = isRelativeToScript ? __dirname : '.';

    return targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(baseDir, parentDir, childDir);
        try {
            fs.mkdirSync(curDir);
        } catch (err) {
            if (err.code === 'EEXIST') { // curDir already exists!
                return curDir;
            }
            // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
            if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
                throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
            }
            const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
            if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
                throw err; // Throw if it's just the last created dir.
            }
        }
        return curDir;
    }, initDir);
}
/**
 * Get ode info from package.json without using cache
 */
let _cachePackageJson = null;
async function _packageJsonOdeUncached() {
    try {
        const filePath = path.resolve(__dirname, "package.json");
        const content = await readFile(filePath)
        const packageJson = JSON.parse(content);
        const ode = packageJson["ode"];
        if (!ode) {
            throw "Package.json does not contains 'ode' info";
        }
        _cachePackageJson = packageJson;
        return ode;
    } catch (e) {
        console.error("Could not find package.json 'ode' info", e);
    }
}
/**
 * Get package JSON info. If @param newValue is setted, update the package.json
 */
async function _packageJsonOde(newValue) {
    const filePath = path.resolve(__dirname, "package.json");
    if (newValue) {
        _cachePackageJson["ode"] = newValue;
        await writeFile(filePath, JSON.stringify(_cachePackageJson, null, 2))
        return newValue;
    }
    if (_cachePackageJson) {
        return _cachePackageJson["ode"];
    }
    return _packageJsonOdeUncached();
}
/**
 * Get current override.
 */
async function _currentOverride() {
    const ode = await _packageJsonOde();
    const current = ode["current"];
    return current;
}

function _overridePathFor(name) {
    return path.resolve(__dirname, "overrides", name)
}
/**
 * Create override dir if not exists
 */
async function _createOverrideDirIfNeeded(name) {
    const overrideDir = _overridePathFor(name);
    _mkdirsSync(overrideDir);
    return overrideDir;
}

/**
 * Save json @param package.json for override @param name
 */
async function _savePackageJsonFor(name, packageJson) {
    await _createOverrideDirIfNeeded(name);
    const packageJsonPath = path.resolve(_overridePathFor(name), "package.json");
    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
}
/**
 * Get the ode bloc of the overriden package.json named: @param name 
 */
async function _packageJsonOdeFor(name) {
    try {
        const packageJsonPath = path.resolve(_overridePathFor(name), "package.json");
        const content = await readFile(packageJsonPath)
        const packageJson = JSON.parse(content);
        const ode = packageJson["ode"];
        if (!ode) {
            throw "Package.json does not contains 'ode' info for override: " + name;
        }
        return ode;
    } catch (e) {
        console.error("Could not find package.json for override: " + name, e);
    }
}
/**
 * 
 */
async function _askConfirm(message) {
    const response2 = await prompts([{
        type: 'text',
        name: 'switch',
        message: message + ' Y/n?',
        validate: value => value && (value.toLowerCase() == "y" || value.toLowerCase() == "n")
    }]);
    return response2.switch.toLowerCase() == "y";
}
/**
 * Get the @param fileList recursivly from the @param directory.
 * Keep only file paths that match the @param filter.
 * Return absolute filePath
 */
function _walkSync(directory, filelist, filter) {
    let files = fs.readdirSync(directory);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(directory, file)).isDirectory()) {
            filelist = _walkSync(path.join(directory, file), filelist);
        }
        else if (!filter || filter(file)) {
            filelist.push(path.join(directory, file));
        }
    });
    return filelist;
};
/**
 * Update native android and iOS properties files using the @param ode from the root package.json
 */
async function _updateAppIds(ode) {
    //update gradle.properties
    const appid = ode["appid"];
    const appname = ode["appname"];
    const gradlePropertiesPath = path.resolve(__dirname, ode["properties"]["android"]);
    let gradleProperties = await readFile(gradlePropertiesPath, { encoding: "utf-8" });
    gradleProperties = gradleProperties.replace(/(APPID=)(.*)/, "$1" + appid).replace(/(APPNAME=)(.*)/, "$1" + appname)
    await writeFile(gradlePropertiesPath, gradleProperties);
    //update info.plist
    const infoPlistPath = path.resolve(__dirname, ode["properties"]["ios"]);
    let infoPlist = await readFile(infoPlistPath, { encoding: "utf-8" });
    const appnameIOS = appname.replace(" ","&#x2007;");//https://stackoverflow.com/questions/46337691/bundle-display-name-missing-space-characters
    infoPlist = infoPlist.replace(/(<key>CFBundleIdentifier<\/key>\s*<string>)(.*)(<\/string>)/, "$1" + appid + "$3").replace(/(<key>CFBundleDisplayName<\/key>\s*<string>)(.*)(<\/string>)/, "$1" + appnameIOS + "$3")
    await writeFile(infoPlistPath, infoPlist);
}
function _overrideFileListAbsolute(name) {
    const overridePath = _overridePathFor(name);
    const fileList = _walkSync(overridePath, [], function (filePath) {
        return filePath.indexOf("package.json") == -1;
    });
    return fileList;
}
/**
 * Switch to the override named @param name. If @param skipRestore is setted, it does not ask for restore. 
 * If @param acceptall is setted, it will accept by default all confirmation.
 * You can also give @param gitUri @param gitUser and @param gitPwd used by fetch config
 */
async function overrideSwitchTo(name, skipRestore, acceptAll, gitUri, gitUser, gitPwd) {
    if (name == "default") {
        //n ooverride to apply => only fetch config
        let confirm = acceptAll || await _askConfirm('Do you want to fetch the default config');
        if (confirm) {
            await fetchConfig(gitUri, gitUser, gitPwd);
            return;
        }
    }
    //
    if (skipRestore) {//for example dont restore from appcenter
        console.log("Skip restoring files.");
    } else {
        console.log("Restoring files before switching...");
        await overrideRestore(true);
    }
    //fetch package.json override
    const odeOverride = await _packageJsonOdeFor(name);
    //list override files recursively
    const fileListAbsolute = _overrideFileListAbsolute(name);
    //display all files going to be replaced
    if (fileListAbsolute.length > 0) {
        console.log("Files are going to be replaced from overrides:")
        for (let i = 0; i < fileListAbsolute.length; i++) {
            const relativePath = path.relative(__dirname, fileListAbsolute[i]);
            console.log("  ", relativePath);
        }
        //prompt confirm
        const confirm = acceptAll || await _askConfirm("Do you confirm the replacement of theses files");
        if (!confirm) {
            process.exit(0);
        }
    } else {
        console.log("There are no files to replace")
    }
    //replace files one by one
    const copyPromises = [];
    const overridePath = _overridePathFor(name);
    for (let i = 0; i < fileListAbsolute.length; i++) {
        const overrideFilePath = fileListAbsolute[i];
        const overrideFilePathRelative = path.relative(overridePath, overrideFilePath)
        const destFilePath = path.resolve(__dirname, overrideFilePathRelative);
        const destDirPath = path.dirname(destFilePath)
        _mkdirsSync(destDirPath)
        copyPromises.push(copyFile(overrideFilePath, destFilePath))
    }
    await Promise.all(copyPromises);
    console.log("Files replaced successfully!")
    //replace origin_package.json (appid,appname) and set current override
    const odeOrigin = await _packageJsonOde();
    for (let i in odeOverride) {
        if (i != "configid") {
            odeOrigin[i] = odeOverride[i];
        }
    }
    odeOrigin["current"] = name;
    odeOrigin["config"]["id"] = odeOverride["configid"];
    await _packageJsonOde(odeOrigin);
    //must pass odeOrigin
    await _updateAppIds(odeOrigin);
    console.log("AppIds replaced successfully!")
    //
    let confirm = acceptAll || await _askConfirm('Do you want to set the config ' + odeOverride["configid"]);
    if (confirm) {
        await fetchConfig(gitUri, gitUser, gitPwd);
    }
}
/**
 * Return the list of overridable path pattern
 */
async function _overridePatterns() {
    const ode = await _packageJsonOde();
    let patterns = ode.overrides || [];
    patterns = patterns.map(function (value) {
        return value.replace(/\*$/, "");//remove wildcard
    });
    return patterns;
}
async function _gitListUncommitted() {
    const overridePatterns = await _overridePatterns();
    //display all uncommited files
    const resGitStatus = await exec("git status --short");
    const lines = resGitStatus.stdout.split("\n");
    //ensure we are fetching uniq file paths
    const filePaths = [];
    const filePathStatus = [];
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index].trim();
        if (line.length == 0) {//empty rows
            continue;
        }
        const lineParts = line.split(/\s+(.+)/);//split only first space
        const status = lineParts[0].trim();
        const filePath = lineParts[1].trim();
        const matchedPatterns = overridePatterns.findIndex(function (pattern) {
            return filePath.indexOf(pattern) > -1 && filePath.indexOf("overrides/")==-1;
        });
        //keep only files that could be overrided
        if (matchedPatterns > -1) {
            filePaths.push(filePath);
            filePathStatus.push(status);
        }
    }
    return { filePaths: filePaths, filePathStatus: filePathStatus }
}

function _gitDisplayUncommitted(filePaths, filePathStatus) {
    for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i];
        const status = filePathStatus[i];
        switch (status) {
            case "A":
                console.log('\x1b[32m%s\x1b[39m %s', status, filePath);
                break;
            case "??":
                console.log('\x1b[33m%s\x1b[39m %s', "U", filePath);
                break;
            case "D":
            case "M":
                console.log('\x1b[31m%s\x1b[39m %s', status, filePath);
                break;
            default:
                console.log(status, filePath);
                break;
        }
    }//end for
}
/**
 * Restore the default override. When @param skipResetConfig is setted, it does not decrypt config
 */
async function overrideRestore(skipResetConfig) {
    const uncommited = await _gitListUncommitted();
    const filePaths = uncommited.filePaths;
    const filePathStatus = uncommited.filePathStatus;
    //display files that will be resetted
    if (filePaths.length) {
        console.log("You are going to reset uncommited/unstaged files below:")
        _gitDisplayUncommitted(filePaths, filePathStatus);
        let confirm = await _askConfirm('Do you confirm to reset theses files');
        if (!confirm) {
            process.exit(0);
        }
        //must do it one after other (git lock)
        for (let i = 0; i < filePaths.length; i++) {
            const filePath = filePaths[i];
            const status = filePathStatus[i];
            if (status == "??") {
                await (unlinkFile(filePath));
            } else if (status == "A") {
                await (exec("git reset HEAD " + filePath).then(function () { return exec("rm -rf " + filePath); }));
            } else {
                await (exec("git checkout -- " + filePath));
            }
        }
    } else {
        console.log("There are no files to restore");
    }
    //restore appids
    console.log("Restoring package.json and native appids...");
    await exec("git checkout -- " + path.resolve(__dirname, "package.json"));
    const ode = await _packageJsonOdeUncached();
    await _updateAppIds(ode);
    //restore default config (prompt)
    if (!skipResetConfig) {
        confirm = await _askConfirm('Do you want to restore the default config');
        if (confirm) {
            await fetchConfig();
        }
    }
}
/**
 * Backup the current override
 */
async function overrideBackup() {
    const current = await _currentOverride();
    if (!current) {
        console.warn("There is nothing to backup (you have not applied an override)");
        return;
    }
    const uncommited = await _gitListUncommitted();
    const filePaths = uncommited.filePaths;
    const filePathStatus = uncommited.filePathStatus;
    //fetch list of current override files
    let fileListAbsolute = _overrideFileListAbsolute(current);
    //display files that will be backed up
    if (filePaths.length) {
        console.log("You are going to backup uncommited/unstaged files below:");
        _gitDisplayUncommitted(filePaths, filePathStatus);
        let confirm = await _askConfirm('Do you confirm to backup theses files in the override ' + current);
        if (!confirm) {
            process.exit(0);
        }
        //replace files one by one
        const copyPromises = [];
        for (let i = 0; i < filePaths.length; i++) {
            const filePath = filePaths[i];
            const overrideFilePath = path.resolve(_overridePathFor(current), filePath);
            //keep in fileList all not founded changed files
            fileListAbsolute = fileListAbsolute.filter(function (value) { return value != overrideFilePath; })
            //
            const backupFilePath = path.resolve(__dirname, filePath);
            if (fs.existsSync(backupFilePath)) {
                const parentDir = path.resolve(overrideFilePath, "..");
                _mkdirsSync(parentDir);
                copyPromises.push(copyFile(backupFilePath, overrideFilePath))
            } else {//file should be removed
                if (fs.existsSync(overrideFilePath)) {
                    copyPromises.push(unlinkFile(overrideFilePath))
                }
            }
        }
        await Promise.all(copyPromises);
        console.log("Files backed up successfully")
        //remove not founded files
        if (fileListAbsolute.length) {
            console.log("The files below seems to not exists anymore:");
            for (let i = 0; i < fileListAbsolute.length; i++) {
                const relativePath = path.relative(__dirname, fileListAbsolute[i]);
                console.log("  ", relativePath);
            }
            confirm = await _askConfirm('Do you want to remove them from override ' + current);
            if (confirm) {
                const unlinkPromise = [];
                for (let i = 0; i < fileListAbsolute.length; i++) {
                    const overrideFilePath = path.resolve(_overridePathFor(current), fileListAbsolute[i]);
                    unlinkPromise.push(unlinkFile(overrideFilePath))
                }
                await Promise.all(unlinkPromise);
                console.log("Files removed from ovveride successfully")
            }
        }
        //
        confirm = await _askConfirm('Do you want to unapplied the current oveeride');
        if (confirm) {
            await overrideRestore();
        }
    } else {
        console.log("There are no files to backup");
    }
    //gradle and info.plist is backup when we create override
}

/**
 * Create a new override
 */
async function overrideCreate() {
    const response = await prompts([{
        type: 'text',
        name: 'name',
        message: 'What is the name of this override?',
        validate: value => value && value.trim().length > 0
    }, {
        type: 'text',
        name: 'appid',
        message: "What is the application's ID for this override?",
        validate: value => value && value.trim().length > 0
    }, {
        type: 'text',
        name: 'appname',
        message: "What is the application's name for this override?",
        validate: value => value && value.trim().length > 0
    }, {
        type: 'text',
        name: 'configid',
        message: "What is the ID of the config?",
        validate: value => value && value.trim().length > 0
    }]);
    if (fs.existsSync(_overridePathFor(response.name))) {
        throw "Override already exists : " + response.name;
    }
    const packageJson = {
        ode: {
            current: response.name,
            appname: response.appname,
            appid: response.appid,
            configid: response.configid
        }
    }
    await _savePackageJsonFor(response.name, packageJson);
    let confirm = await _askConfirm('Switch to the new override ' + response.name)
    if (confirm) {
        overrideSwitchTo(response.name);
    }
}
/**
 * Fetch config files from a safe repo. If @param uri is setted, it does not prompt the user to fill uri. 
 */
async function fetchConfig(uri, username, password) {
    const ode = await _packageJsonOde();
    if (!uri) {
        const response = await prompts([{
            type: 'text',
            name: 'uri',
            required: true,
            initial: ode["config"]["url"] || "",
            message: "What is the repo's URL?",
            validate: value => value && value.trim().length > 0
        }, {
            type: 'text',
            name: 'username',
            message: "What is the repo's username?"
        }, {
            type: 'password',
            name: 'password',
            message: "What is the repo's password?"
        }]);
        uri = response.uri;
        username = response.username;
        password = response.password;
    }
    //check uri
    const isHttp = uri.startsWith("http://");
    const isHttps = uri.startsWith("https://");
    if (!isHttp && !isHttps) {
        console.error("The git URI should use HTTP(S) protocol");
        process.exit(1);
    }
    //build git command
    const tmpDirName = new Date().getTime() + "";
    const tmpDir = path.resolve(os.tmpdir(), tmpDirName);
    const protocol = isHttp ? "http://" : "https://";
    let fullUri = uri;
    if (username) {
        const uriWithoutProtocol = uri.replace(protocol, "");
        if (password) {
            fullUri = protocol + username + ":" + password + "@" + uriWithoutProtocol;
        } else {
            fullUri = protocol + username + "@" + uriWithoutProtocol;
        }
    }
    const gitCmd = "git clone " + fullUri + " " + tmpDir;
    await exec(gitCmd);
    //copy each config files
    const configId = ode["config"]["id"];
    const baseSrcPath = path.resolve(tmpDir, configId);
    const copyPromises = [];
    for (srcFilename in ode["config"]) {
        if (srcFilename != "id" && srcFilename != "url") {
            const destFilepath = ode["config"][srcFilename];
            const destFilepathFull = path.resolve(__dirname, destFilepath);
            const srcFilepathFull = path.resolve(baseSrcPath, srcFilename);
            console.log("Restoring config:", srcFilepathFull, "~>", destFilepathFull)
            copyPromises.push(copyFile(srcFilepathFull, destFilepathFull));
        }
    }
    await Promise.all(copyPromises);
    console.log("Config files restored successfully");
}
async function overrideGetCurrent() {
    const current = await _currentOverride();
    if (current) {
        console.log("The following override have been applied: ", current);
    } else {
        console.log("There are no overrides applied!")
    }
}
/**
 * Parse cmd args
 */
require('yargs')
    .command('fetch-config', 'get config from git', (yargs) => {
        yargs.option('uri', {
            describe: 'uri of the git repo (uri could include password and username)',
            alias: 'h'
        }).option('username', {
            describe: 'username of the git repo',
            alias: 'u'
        }).option('password', {
            describe: 'password of the git repo',
            alias: 'p'
        })
    }, (argv) => {
        fetchConfig(yargs.uri, yargs.username, yargs.password);
    })
    .command("override", "manage overrides", (yargs) => {
        yargs.command('switch', 'switch to an override', (yargs) => {
            yargs.option('to', {
                describe: "name of the override to switch to (if you set 'default' it will only fetch config)",
                required: true
            }).option('dontrestore', {
                describe: 'if setted the restauration does not occurs'
            }).option('uri', {
                describe: 'uri of the git repo (uri could include password and username)',
                alias: 'h'
            }).option('username', {
                describe: 'username of the git repo',
                alias: 'u'
            }).option('password', {
                describe: 'password of the git repo',
                alias: 'p'
            }).option('acceptall', {
                describe: 'accept all prompts',
                alias: 'a'
            })
        }, (argv) => {
            overrideSwitchTo(argv.to, argv.dontrestore, argv.acceptall, argv.uri, argv.username, argv.password);
        }).command('restore', 'restore the default override', (yargs) => { }, (argv) => {
            overrideRestore();
        }).command('backup', 'backup the current override', (yargs) => { }, (argv) => {
            overrideBackup();
        }).command('create', 'create a new override', (yargs) => { }, (argv) => {
            overrideCreate();
        })
    }, (argv) => {
        overrideGetCurrent();
    })
    .argv
