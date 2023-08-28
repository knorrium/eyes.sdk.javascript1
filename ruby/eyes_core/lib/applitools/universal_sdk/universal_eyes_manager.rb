# frozen_string_literal: true

# require_relative 'universal_eyes'

module Applitools
  class UniversalEyesManager

    extend Forwardable
    def_delegators 'Applitools::EyesLogger', :logger

    def initialize(manager, universal_client)
      @manager = manager
      @universal_client = universal_client
      @opened_eyes = []
    end

    def open_eyes(driver_config_json, config)
      # Applitools::EyesLogger.logger.debug "Driver: #{driver_config_json}"
      # Applitools::EyesLogger.logger.debug "open config: #{config}"

      @eyes = @universal_client.eyes_manager_make_eyes(@manager, driver_config_json, config)

      if @eyes[:message] === 'socket hang up'
        Applitools::EyesLogger.logger.error "#{Applitools::Connectivity::UniversalClient::EYES_MANAGER_MAKE_EYES} : socket hang up ; retry"
        @eyes = @universal_client.eyes_manager_make_eyes(@manager, driver_config_json, config)
      end
      if @eyes[:message] && @eyes[:stack]
        Applitools::EyesLogger.logger.error "Eyes not opened: #{@eyes[:message]}"
        Applitools::EyesLogger.logger.debug "Stack for #{Applitools::Connectivity::UniversalClient::EYES_MANAGER_MAKE_EYES} : #{@eyes[:stack]}"
        return nil
      end

      Applitools::EyesLogger.logger.debug "Eyes applitools-ref-id: #{@eyes[:"applitools-ref-id"]}"
      # U-Notes : !!! Eyes.new
      universal_eyes = Applitools::UniversalEyes.new(@eyes, @universal_client)
      @opened_eyes.push(universal_eyes)
      universal_eyes
    end

    def close_all_eyes(remove_duplicate_tests)
      @opened_eyes.each {|universal_eye| universal_eye.closed_or_aborted = true }
      @universal_client.eyes_manager_close_all_eyes(@manager, remove_duplicate_tests)
    end

  end

end
# U-Notes : Added internal Applitools::UniversalEyesManager
