# frozen_string_literal: true

module Applitools::EyesUniversal
  module UniversalServerGemFinder
    extend self

    SERVER_GEM_NAME = 'eyes_universal'

    def filepath
      server_lib ? File.join(server_lib.gem_dir, 'ext', 'eyes-universal', filename) : ''
    end

    def other_filepaths
      in_gem_path = File.join('gems', server_lib.full_name, 'ext', 'eyes-universal', filename)
      Gem.path.map {|path| File.expand_path(in_gem_path, path) }
    end

    def executable_filepath
      raise 'Universal server not Found' if server_lib.nil?
      return filepath if valid_file?(filepath)
      core_path = other_filepaths.find {|path| valid_file?(path) }
      return core_path if core_path
      raise 'Universal server unrecognized'
    end

    private

    def server_lib
      Gem::Specification.find_by_name(SERVER_GEM_NAME)
    rescue Gem::MissingSpecError
      nil
    end

    def filename
      return 'core-win.exe' if Gem.win_platform?
      case RUBY_PLATFORM
        when /darwin/i
          'core-macos'
        when /arm/i
          'core-linux-arm64'
        when /mswin|windows|mingw/i
          'core-win.exe'
        when /musl/i
          'core-alpine'
        when /linux|arch/i
          'core-linux'
        else
          raise 'Unsupported platform'
      end
    end

    def valid_file?(path)
      File.exist?(path) && File.executable?(path)
    end

  end
end
