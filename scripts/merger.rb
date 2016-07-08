#!/usr/bin/env ruby
require 'json'

inputs = Dir.glob("results/*.json")
input_count = inputs.length

puts '['

inputs.each_with_index{|file, index|
  image_id = File.basename(file, '.json')

  record = JSON.parse(File.read(file))
  record[0]['imageId'] = image_id

	puts record[0].to_json
	puts ',' if index != input_count - 1
}

puts ']'
