#!/usr/bin/env bash

echo "=== Doing post build actions... ==="
if [ ! -z "${APPCENTER_ANDROID_MODULE}" ];
then
    echo "Copying Proguard files to App Center's Output directory: " $APPCENTER_OUTPUT_DIRECTORY
    cp build/outputs/mapping/release/* $APPCENTER_OUTPUT_DIRECTORY/
fi
echo "=== Post build action finished ==="
