source 'https://rubygems.org'

ruby File.read(File.join(__dir__, '.ruby-version')).strip

gem 'cocoapods'
gem "fastlane"

plugins_path = File.join(File.dirname(__FILE__), 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
