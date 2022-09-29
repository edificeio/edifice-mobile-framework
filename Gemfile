source 'https://rubygems.org'

ruby '2.7.5'

gem 'cocoapods', '~> 1.11', '>= 1.11.2'
gem "fastlane"

plugins_path = File.join(File.dirname(__FILE__), 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
