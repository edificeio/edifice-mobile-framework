#!/usr/bin/env bash

# Set up React native JS bundle (PROD ONLY)
./node_modules/.bin/react-native bundle --platform android --dev true --entry-file index.js --bundle-output android/app/build/intermediates/assets/debug/index.android.bundle --assets-dest android/app/build/intermediates/res/merged/debug