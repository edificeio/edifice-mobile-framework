#!/usr/bin/env bash

# Update pod cache cause of an issue with app center
# See https://github.com/microsoft/react-native-code-push/issues/1687
# (Remove this file if this issue is resolved)
#!/usr/bin/env bash

echo 'Installing CocoaPods 1.7.5'
echo 'Remove this script when AppCenter module will be compatible with CocoaPods 1.8.x'

# Remove installed cocoapods version
sudo gem uninstall cocoapods -a -x

# Install v1.7.5
sudo gem install cocoapods -v 1.7.5

# Pod cache clean
# pod cache clean --all # NO WAY !!
