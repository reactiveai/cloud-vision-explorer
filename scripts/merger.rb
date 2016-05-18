#!/usr/bin/env ruby
require 'json'

output = File.open('vision_api.json', 'w')
inputs = Dir.glob("results/*.json")
input_count = inputs.length

output.puts '['

inputs.each_with_index{|file, index|
  image_id = File.basename(file, '.json')

  record = JSON.parse(File.read(file))
	record['responses'][0]['imageId'] = image_id

	output.puts record.to_json
	output.puts ',' if index != input_count - 1
}

output.puts ']'
output.close
