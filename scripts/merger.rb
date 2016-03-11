#!/usr/bin/env ruby
require 'json'

f = File.open("#{ARGV[0]}/vision_api.json", 'w')

records = []
p "#{ARGV[0]}/result/*.json"
Dir.glob("#{ARGV[0]}/result/*.json").each{|file|
  image_id = File.basename(file, '.json')
  puts image_id

  record = JSON.parse(File.read(file)).first
  record['imageId'] = image_id
  records << JSON.dump(record)
}

f.puts '['
f.puts records.join(",\n")
f.puts ']'

f.close
