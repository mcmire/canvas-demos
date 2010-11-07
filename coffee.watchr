# Adapted from http://gist.github.com/483101

ENV["WATCHR"] = "1"
system('clear')

def stringify_cmd(cmd)
  cmd.map {|x| x =~ /[ ]/ ? x.inspect : x }.join(" ")
end

def growlnotify(options={})
  title = options.delete(:title)
  growlnotify = `which growlnotify`.chomp
  cmd = []
  cmd << growlnotify
  cmd += options.map {|k,v| ["--#{k}", v] }.flatten
  cmd << title if title
  puts stringify_cmd(cmd)
  system(*cmd)
end

def growl(options)
  image = "#{ENV['HOME']}/.watchr_images/#{options.delete(:passed) ? 'passed' : 'failed'}.png"
  growlnotify options.merge(:image => image)
end

def run(*cmd)
  cmd = cmd.flatten
  cmd_as_string = stringify_cmd(cmd)
  #growlnotify :title => "Running command...", :message => cmd_as_string
  puts cmd_as_string
  output = `#{cmd_as_string} 2>&1`
  puts output
  status = $?.exitstatus
  yield cmd_as_string, output, status
end

def constantly_compile(options)
  options[:from].chop! if options[:from] =~ %r{/$}
  options[:to].chop! if options[:to] =~ %r{/$}
  pattern = "#{options[:from]}/**/*.coffee"
  puts "Watching #{pattern}"
  system("mkdir -p #{options[:to]}")
  watch("^#{options[:from]}/(.+\.coffee)$") {|m|
    run("coffee", "-o", options[:to], options[:from]) do |cmd, output, status|
      if output.to_s.empty?
        growl :passed => true, :title => "CoffeeScript conversion complete!", :message => "Successfully converted #{pattern}"
      else
        growl :passed => false, :title => "CoffeeScript conversion failed", :message => output.split("\n")[0]
      end
    end
  }
end

constantly_compile(:from => "coffee", :to => "coffee-compiled")
constantly_compile(:from => "jasmine/coffee", :to => "jasmine/spec")

=begin
# Ctrl-\
Signal.trap 'QUIT' do
  puts " --- Running all specs ---\n\n"
  run_all_specs
end

@interrupted = false

# Ctrl-C
Signal.trap 'INT' do
  if @interrupted then
    @wants_to_quit = true
    abort("\n")
  else
    puts "Interrupt a second time to quit"
    @interrupted = true
    Kernel.sleep 1.5
    # raise Interrupt, nil # let the run loop catch it
    run_suite
  end
end
=end