#!/usr/bin/env bash

if [ "$APPCENTER_BRANCH" == "dev" || "$APPCENTER_BRANCH" == "appcenter" ];
then
    echo "Generate JS bundle and assets for Debug environment"
    ./node_modules/.bin/react-native bundle --platform android --dev true --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/build/generated/res/react/debug
else
    echo "Generate JS bundle and assets for Release environment"
    ./node_modules/.bin/react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/build/generated/res/react/release
fi
