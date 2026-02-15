STDOUT.sync = true
puts "Before gets"
STDOUT.flush
name = STDIN.gets
puts "After gets: #{name}"
