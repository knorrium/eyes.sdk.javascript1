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
        # 'core.tar.gz'      => '18c85f7aa8800b954847640dfb959cc48794ad05d95dde96c15db42c9154792f',
        'core-alpine'      => '1312f4d7cdce8fc3e569cfe8cc6892a6b7e2dd7935119468ace077feb56b59e1',
        'core-linux'       => '5b507e26957b1b1d4145f4f74588d269c48be7c03e4036aa8a3fa74c97a80323',
        'core-linux-arm64' => 'c0c08c9e1b9a1b23f44953ec4e19cbbd3a7235a5d2c0bdbda4d432e47343851e',
        'core-macos'       => 'dcec55c6f7cf1cb3bd6b018a75c68a941f630f4c7cf785132522c7ed19621930',
        'core-win.exe'     => 'b57675e704b39ca149bd192bb3f387404a65e9ebc5ee275fea7d33dc4d34edcb'
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

      def tar_gz_download(to) # build - depricated
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
        # downloaded_sha = Digest::SHA256.file(where).to_s
        # puts "[eyes-universal] prepare server : #{where} #{downloaded_sha}"
        puts "[eyes-universal] prepare server : #{where}"

        # if downloaded_sha == tar_gz_sha
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

              # binary_sha = Digest::SHA256.file(unpacked_binary).to_s
              # if check_binary(binary_filename, binary_sha)
                FileUtils.chmod('+x', unpacked_binary)
                puts "[eyes-universal] Binary ready #{binary_filename} (#{Applitools::UNIVERSAL_CORE_VERSION}) at #{unpacked_binary}"
              # else
              #   puts "[eyes-universal] Binary check fail #{binary_filename} (#{Applitools::UNIVERSAL_CORE_VERSION}): #{binary_sha}"
              # end
            end
          end
        # else
        #   puts "[eyes-universal] Server broken. (mismatch: #{downloaded_sha})"
        # end
      end

      def get_compress_all_binaries(to)
        filenames = EXPECTED_SHA.keys

        target_core = File.expand_path(tar_gz_filename, to)
        File.open(target_core, "wb") do |file|
          Zlib::GzipWriter.wrap(file) do |gzip|
            Gem::Package::TarWriter.new(gzip) do |tar|

              filenames.each do |fname|
                binary_url = URI.join(base_url, fname)
                where = File.expand_path(fname, to)
                # unless File.exist?(where) && Digest::SHA256.file(where).to_s == EXPECTED_SHA[fname] # local dev/debug
                  binary_url.open {|cloud| File.binwrite(where, cloud.read) }
                # end
                # downloaded_sha = Digest::SHA256.file(where).to_s
                # if downloaded_sha == EXPECTED_SHA[fname]
                  mode = File.stat(where).mode
                  tar.add_file_simple(fname, mode, File.size(where)) do |io|
                    File.open(where, "rb") do |f|
                      io.write(f.read)
                    end
                  end
                  puts "[eyes-universal] Download complete. Server placed in #{where}"
                # else
                #   puts "[eyes-universal] Download broken. (#{fname} mismatch: #{downloaded_sha})"
                # end
              end

            end
          end
        end

        if File.exist?(target_core)
          puts "[eyes-universal] Download complete (#{Applitools::UNIVERSAL_CORE_VERSION}). Server placed in #{target_core}"
        else
          raise "[eyes-universal] ERROR : Download incomplete (#{Applitools::UNIVERSAL_CORE_VERSION}). Server not ready"
        end
      end

      private

      def base_url
        "https://github.com/applitools/eyes.sdk.javascript1/releases/download/js%2Fcore%40#{Applitools::UNIVERSAL_CORE_VERSION}/"
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
