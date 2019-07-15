#!/usr/bin/env bash

echo "Prepare project..."
[ -z "$APPCENTER_TO" ] && echo "Need to set APPCENTER_TO" && exit 1;
[ -z "$APPCENTER_URI" ] && echo "Need to set APPCENTER_URI" && exit 1;
[ -z "$APPCENTER_USERNAME" ] && echo "Need to set APPCENTER_USERNAME" && exit 1;
[ -z "$APPCENTER_PWD" ] && echo "Need to set APPCENTER_PWD" && exit 1;
npm run appcenter:config
echo "Ready for build!"
# if [ ! -z "${APPCENTER_ANDROID_MODULE}" ];
# then
#     echo "=== Generate Android JS bundle ==="
#     npm run appcenter:build:android
# fi

# if [ ! -z "${APPCENTER_XCODE_SCHEME}" ];
# then
#     echo "=== It is an iOS Project ==="
#     npm run appcenter:build:ios
# fi
