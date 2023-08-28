# frozen_string_literal: true

require 'eyes_selenium'
require 'eyes_images'

Dir['./spec/support/**/*.rb'].sort.each { |f| require f }

RSpec.configure do |config|
  config.formatter = :documentation


  config.before clear_environment: true do
    Applitools::Helpers.instance_variable_set :@environment_variables, {}
  end

end
