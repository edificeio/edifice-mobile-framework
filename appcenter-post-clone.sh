#!/usr/bin/env bash

# Update pod cache cause of an issue with app center
# See https://github.com/microsoft/react-native-code-push/issues/1687
# (Remove this file if this issue is resolved)
#!/usr/bin/env bash

echo 'Doing some post-clone stuff...'

#This should match what's in Podfile.lock for COCOAPODS:
COCOAPODS_VER=1.7.5

echo "Installing CocoaPods version $COCOAPODS_VER"

sudo gem install cocoapods -v $COCOAPODS_VER

echo "Finished installing CocoaPods version $COCOAPODS_VER"