#!/usr/bin/env bash

# Update pod cache cause of an issue with app center
# See https://github.com/microsoft/react-native-code-push/issues/1687
# (Remove this file if this issue is resolved)
pod cache clean --all
pod repo update
