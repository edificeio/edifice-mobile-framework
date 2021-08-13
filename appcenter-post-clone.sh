#!/usr/bin/env bash
sudo gem install cocoapods
pod cache clean --all
pod repo update

#brew unlink node
#brew install node@14.17.5
#brew link node

#npm install npm@6.14.14

echo "**********"
echo "pod = "$(pod --version)
echo "npm = "$(npm -v)
echo "node = "$(node -v)
echo "**********"
