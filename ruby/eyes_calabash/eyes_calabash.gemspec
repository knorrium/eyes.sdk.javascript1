# frozen_string_literal: true

lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

require 'applitools/eyes_calabash/version'

Gem::Specification.new do |spec|
  spec.name          = 'eyes_calabash'
  spec.version       = Applitools::EyesCalabash::VERSION
  spec.authors       = ['Applitools Team']
  spec.email         = ['team@applitools.com']
  spec.description   = 'Provides SDK for writing Applitools Calabash tests.'
  spec.summary       = 'Applitools Ruby Calabash SDK'
  spec.homepage      = 'https://www.applitools.com'
  spec.license       = 'Applitools'

  spec.metadata['yard.run'] = 'yri' # use "yard" to build full HTML docs.

  spec.files         = `git ls-files lib/applitools/calabash`.split($RS) + [
    'lib/eyes_calabash.rb',
    'lib/applitools/calabash_steps.rb',
    'lib/applitools/eyes_calabash/version.rb',
    'CHANGELOG.md',
    'eyes_calabash.gemspec',
    'Rakefile',
  ]
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = %w(lib)
  spec.add_dependency 'cucumber'
  spec.add_dependency 'file_utils'
  spec.add_dependency 'rspec-expectations'
  spec.add_dependency 'eyes_core', "= #{Applitools::EyesCalabash::VERSION}"
end
