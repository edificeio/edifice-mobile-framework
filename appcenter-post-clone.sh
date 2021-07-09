#!/usr/bin/env bash
pod --version
sudo gem install cocoapods
pod cache clean --all
pod repo update
pod --version