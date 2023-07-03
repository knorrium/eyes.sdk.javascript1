# frozen_string_literal: true

require 'open-uri'
require 'digest'
require 'fileutils'
require 'rubygems/package'
require 'zlib'

module Applitools
  class UniversalServerDownloader
    class << self

      EXPECTED_SHA = {
        'core.tar.gz'      => '18c85f7aa8800b954847640dfb959cc48794ad05d95dde96c15db42c9154792f',
        'core-alpine'      => 'd1ad7cca06eccca88bdd16c4dabd902e56b0868998e62bd95ec4b5a2b9c428eb',
        'core-linux'       => 'b07fedfafc56bee33190bcab25560a93aba71c3379292f387bac7247d3d617a8',
        'core-linux-arm64' => 'e6a42137b84846882bb4458ac134091621fe7a9b169537317c21b747ab47ffad',
        'core-macos'       => '5cc86642cf94ad59a8e1d4a258a283e300be960f3ae7cb97338cb0e53f837998',
        'core-win.exe'     => '629c6d925f55edf53c3bb71fc671efdf9bf3e3185d77e93e7b6b48ed81cd8903'
      }

      def download(to)
        puts "[eyes-universal] Downloading Eyes universal server from #{full_url}"
        where = filepath(to)
        full_url.open {|cloud| File.binwrite(where, cloud.read) }
        if Digest::SHA256.file(where).to_s == expected_binary_sha
          FileUtils.chmod('+x', where)
          puts "[eyes-universal] Download complete. Server placed in #{where}"
        else
          puts "[eyes-universal] Download broken. Please try reinstall"
        end
      end

      def filepath(to)
        File.expand_path(filename, to)
      end

      def tar_gz_filepath(to)
        File.expand_path(tar_gz_filename, to)
      end

      def tar_gz_download(to) # build
        puts "[eyes-universal] Downloading Core server from #{tar_gz_full_url}"
        where = tar_gz_filepath(to)
        unless File.exist?(where) && Digest::SHA256.file(where).to_s == tar_gz_sha
          tar_gz_full_url.open {|cloud| File.binwrite(where, cloud.read) }
        end
        downloaded_sha = Digest::SHA256.file(where).to_s
        if downloaded_sha == tar_gz_sha
          Gem::Package::TarReader.new(Zlib::GzipReader.open(where)) do |tar|
            tar.each do |entry|
              binary_filename = File.basename(entry.full_name)
              dest = File.expand_path(binary_filename, to)
              dest_dir = File.dirname(dest)
              FileUtils.mkdir_p(dest_dir) unless Dir.exist?(dest_dir)
              FileUtils.remove_file(dest) if File.exist?(dest)
              File.open(dest, 'wb') {|f| f.print entry.read }

              binary_sha = Digest::SHA256.file(dest).to_s
              if check_binary(binary_filename, binary_sha)
                FileUtils.chmod('+x', dest)
                puts "[eyes-universal] Binary check pass #{binary_filename} (#{Applitools::UNIVERSAL_CORE_VERSION}): #{dest}"
                FileUtils.rm(dest)
              else
                raise "[eyes-universal] Binary fail #{binary_filename} (#{Applitools::UNIVERSAL_CORE_VERSION}): #{binary_sha}"
              end
            end
          end
          puts "[eyes-universal] Download complete (#{Applitools::UNIVERSAL_CORE_VERSION}). Server placed in #{where}"
        else
          raise "[eyes-universal] Download broken. (mismatch: #{downloaded_sha})"
        end
      end

      def prepare_server(to) # install
        where = tar_gz_filepath(to)
        downloaded_sha = Digest::SHA256.file(where).to_s
        puts "[eyes-universal] prepare server : #{where} #{downloaded_sha}"

        if downloaded_sha == tar_gz_sha
          Gem::Package::TarReader.new(Zlib::GzipReader.open(where)) do |tar|
            tar.each do |entry|
              binary_filename = File.basename(entry.full_name)
              if filename != binary_filename
                puts "[eyes-universal] skip #{binary_filename}"
                next
              end
              puts "[eyes-universal] process #{binary_filename}"
              unpacked_binary = File.expand_path(binary_filename, to)
              # FileUtils.remove_file(unpacked_binary) if File.exist?(unpacked_binary)
              File.open(unpacked_binary, 'wb') {|f| f.print entry.read }

              binary_sha = Digest::SHA256.file(unpacked_binary).to_s
              if check_binary(binary_filename, binary_sha)
                FileUtils.chmod('+x', unpacked_binary)
                puts "[eyes-universal] Binary ready #{binary_filename} (#{Applitools::UNIVERSAL_CORE_VERSION}) at #{unpacked_binary}"
              else
                puts "[eyes-universal] Binary check fail #{binary_filename} (#{Applitools::UNIVERSAL_CORE_VERSION}): #{binary_sha}"
              end
            end
          end
        else
          puts "[eyes-universal] Server broken. (mismatch: #{downloaded_sha})"
        end
      end

      private

      def base_url
        "https://github.com/applitools/eyes.sdk.javascript1/releases/download/%40applitools/core%40#{Applitools::UNIVERSAL_CORE_VERSION}/"
      end

      def full_url
        URI.join(base_url, filename)
      end

      def expected_binary_sha
        return EXPECTED_SHA['core-win.exe'] if Gem.win_platform?
        case RUBY_PLATFORM
          when /darwin/i
            EXPECTED_SHA['core-macos']
          when /arm/i
            EXPECTED_SHA['core-linux-arm64']
          when /mswin|windows|mingw/i
            EXPECTED_SHA['core-win.exe']
          when /musl/i
            EXPECTED_SHA['core-alpine']
          when /linux|arch/i
            EXPECTED_SHA['core-linux']
          else
            raise 'Unsupported platform'
        end
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

      def tar_gz_full_url
        URI.join(base_url, tar_gz_filename)
      end

      def tar_gz_filename
        'core.tar.gz'
      end
      def tar_gz_sha
        EXPECTED_SHA[tar_gz_filename]
      end

      def check_binary(binary_filename, binary_sha)
        expected_sha = EXPECTED_SHA[binary_filename]
        raise "Unsupported platform #{binary_filename}" if expected_sha.nil?
        binary_sha == expected_sha
      end

    end
  end
end
