# frozen_string_literal: true

require 'eyes_selenium'
require 'capybara'

module Applitools
  module Selenium
    module Capybara
      extend Applitools::RequireUtils
      def self.require_dir(dir)
        load_dir = File.dirname(File.expand_path(__FILE__))
        Dir[File.join(load_dir, 'applitools', dir, '*.rb')].sort.each do |f|
          require f
        end
      end
    end
  end
end

Applitools::Selenium::Capybara.require_dir 'capybara'

module Applitools
  extend Applitools::Selenium::Capybara::CapybaraSettings
  register_capybara_driver
end
