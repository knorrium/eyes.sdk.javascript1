# frozen_string_literal: true

require 'open-uri'
require 'rubygems/package'
require 'zlib'

module Applitools
  module EyesUniversal
    class UniversalServerDownloader
      class << self

        def tar_gz_filepath(to)
          File.expand_path(tar_gz_filename, to)
        end


        def prepare_server(to) # install
          where = tar_gz_filepath(to)
          puts "[eyes-universal] prepare server : #{where}"

          Gem::Package::TarReader.new(Zlib::GzipReader.open(where)) do |tar|
            tar.each do |entry|
              binary_filename = File.basename(entry.full_name)
              if filename != binary_filename
                puts "[eyes-universal] skip #{binary_filename}"
                next
              end
              puts "[eyes-universal] process #{binary_filename}"
              unpacked_binary = File.expand_path(binary_filename, to)
              File.open(unpacked_binary, 'wb') {|f| f.print entry.read }

              FileUtils.chmod('+x', unpacked_binary)
              # binary_version = `#{unpacked_binary} --version`
              puts "[eyes-universal] Binary ready #{binary_filename} (#{Applitools::EyesUniversal::UNIVERSAL_CORE_VERSION}) at #{unpacked_binary}"
            end
          end
        end


        def get_compress_all_binaries(to)
          filenames = ['core-alpine', 'core-linux', 'core-linux-arm64', 'core-macos', 'core-win.exe']

          target_core = File.expand_path(tar_gz_filename, to)
          if File.exist?(target_core)
            puts "[eyes-universal] Use Server placed in #{target_core}"
            return
          end
          File.open(target_core, "wb") do |file|
            Zlib::GzipWriter.wrap(file) do |gzip|
              Gem::Package::TarWriter.new(gzip) do |tar|

                filenames.each do |fname|
                  binary_url = URI.join(base_url, fname)
                  where = File.expand_path(fname, to)
                  binary_url.open {|cloud| File.binwrite(where, cloud.read) }
                  mode = File.stat(where).mode
                  tar.add_file_simple(fname, mode, File.size(where)) do |io|
                    File.open(where, "rb") do |f|
                      io.write(f.read)
                    end
                  end
                  puts "[eyes-universal] Download complete. Server placed in #{where}"
                end

              end
            end
          end

          if File.exist?(target_core)
            puts "[eyes-universal] Download complete (#{Applitools::EyesUniversal::UNIVERSAL_CORE_VERSION}). Server placed in #{target_core}"
          else
            raise "[eyes-universal] ERROR : Download incomplete (#{Applitools::EyesUniversal::UNIVERSAL_CORE_VERSION}). Server not ready"
          end
        end


        private

        def base_url
          "https://github.com/applitools/eyes.sdk.javascript1/releases/download/js%2Fcore%40#{Applitools::EyesUniversal::UNIVERSAL_CORE_VERSION}/"
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
            raise "Unsupported platform #{RUBY_PLATFORM}"
          end
        end

        def tar_gz_filename
          'core.tar.gz'
        end


      end
    end
  end
end
