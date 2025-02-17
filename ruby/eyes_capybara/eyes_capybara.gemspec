# frozen_string_literal: true

lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

require 'applitools/eyes_capybara/version'

Gem::Specification.new do |spec|
  spec.name          = 'eyes_capybara'
  spec.version       = Applitools::EyesCapybara::VERSION
  spec.authors       = ['Applitools Team']
  spec.email         = ['team@applitools.com']
  spec.description   = 'Provides Capybara support for Applitools Selenium SDK'
  spec.summary       = 'Applitools Ruby Capybara SDK'
  spec.homepage      = 'https://www.applitools.com'
  spec.license       = 'Applitools'

  spec.files         = `git ls-files lib/applitools/capybara`.split($RS) + [
    'lib/eyes_capybara.rb',
    'lib/applitools/eyes_capybara/version.rb',
    'CHANGELOG.md',
    'eyes_capybara.gemspec',
    'Rakefile',
  ]
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = %w(lib)
  spec.add_dependency 'eyes_selenium', "= #{Applitools::EyesCapybara::VERSION}"
  spec.add_dependency 'capybara'
end
