# frozen_string_literal: true

require 'eyes_core'

module Applitools
  module Images
    extend Applitools::RequireUtils

    def self.require_dir(dir)
      load_dir = File.dirname(File.expand_path(__FILE__))
      Dir[File.join(load_dir, 'applitools', dir, '*.rb')].sort.each do |f|
        require f
      end
    end
  end
end

Applitools::Images.require_dir 'images'
