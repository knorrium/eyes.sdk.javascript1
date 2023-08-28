# frozen_string_literal: false

require 'eyes_core'

module Applitools
  module Calabash
    extend Applitools::RequireUtils

    def self.require_dir(dir)
      load_dir = File.dirname(File.expand_path(__FILE__))
      Dir[File.join(load_dir, 'applitools', dir, '*.rb')].sort.each do |f|
        require f
      end
    end

    def self.require_environment(requirement, env)
      dirname = File.dirname(requirement)
      filename = File.basename(requirement)
      filename += '.rb' unless /^.*\.rb$/ =~ filename
      file_to_require = File.join(load_dir, dirname, filename)
      env_dependent_requirement = File.join(load_dir, dirname, "#{env}_#{filename}")
      require file_to_require if File.exist?(file_to_require)
      require env_dependent_requirement if File.exist?(env_dependent_requirement)
    end
  end
end

Applitools::Calabash.require_dir 'calabash'
