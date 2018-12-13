#!/usr/bin/env bash

if [[ ! -z "${APPCENTER_ANDROID_MODULE}" ]];
then
    echo "=== Generate Android JS bundle ==="

    if [ "$APPCENTER_BRANCH" == "master" || "$APPCENTER_BRANCH" == "test-prod" ];
    then
        echo "Generate JS bundle and assets for Release environment"
        ./node_modules/.bin/react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/build/generated/res/react/release
    else
        echo "Generate JS bundle and assets for Debug environment"
        ./node_modules/.bin/react-native bundle --platform android --dev true --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/build/generated/res/react/debug
    fi
fi

if [[ ! -z "${APPCENTER_XCODE_SCHEME}" ]];
then
    echo "=== It is an iOS Project ==="