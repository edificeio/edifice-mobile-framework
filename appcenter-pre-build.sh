#!/usr/bin/env bash

if [ ! -z "${APPCENTER_ANDROID_MODULE}" ];
then
    echo "=== Generate Android JS bundle ==="
    echo "Generate JS bundle and assets for Release environment"
        ./node_modules/.bin/react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/build/generated/res/react/release

fi

if [ ! -z "${APPCENTER_XCODE_SCHEME}" ];
then
    echo "=== It is an iOS Project ==="
fi
