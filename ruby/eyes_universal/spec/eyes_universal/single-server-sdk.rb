require 'eyes_universal'

universal_server_control = Applitools::EyesUniversal::UniversalServerControl.instance

STDOUT.puts universal_server_control.to_s
STDOUT.flush

input = STDIN.gets
termination_type = input.chomp

return if termination_type == '1'
raise if termination_type == '2'
