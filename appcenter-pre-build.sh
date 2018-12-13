#!/usr/bin/env bash

# Set up React native JS bundle (PROD ONLY)
./node_modules/.bin/react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/build/intermediates/assets/release/index.android.bundle --assets-dest android/app/build/intermediates/res/merged/release