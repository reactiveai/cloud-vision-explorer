#!/usr/bin/env ruby
require 'json'

records = []
Dir.glob("results/*.json").each do |file|
  image_id = File.basename(file, '.json')

  record = JSON.parse(File.read(file))
  record['imageId'] = image_id
  records << record
end

File.open('vision_api.json', 'w') do |f|
  f.puts '['
  f.puts records.join(",\n")
  f.puts ']'
end
