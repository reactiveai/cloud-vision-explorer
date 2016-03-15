#!/usr/bin/env ruby

require 'json'

raise "Usage:./generate_vision_safe_data.rb safe_id_json_filepath vision_api_directorypath" if ARGV.size != 2

def generate_vision_safe_data(safe_id_json_filepath:, vision_api_directorypath:)

  safe_id_checker = {}
  #construct safe ids
  open(safe_id_json_filepath).read.split("\n").each do |id|
    safe_id_checker[id] = true
  end

  vision_api_json_filenames = ['vision_api_1000.json', 'vision_api_5000.json', 'vision_api_10000.json', 'vision_api.json']
  
  output_files = {
    'vision_api_1000.json' => File.open("vision_api_1000_safe.json", 'w'),
    'vision_api_5000.json' => File.open("vision_api_5000_safe.json", 'w'),
    'vision_api_10000.json' => File.open("vision_api_10000_safe.json", 'w'),
    'vision_api.json' => File.open("vision_api_safe.json", 'w')
  }

  #filter by safe image id
  filtered_vision_api_json = {}
  vision_api_json_filenames.each do |file|
    filtered_vision_api_json[file] = []
    records = JSON.parse(File.read(vision_api_directorypath + '/' + file))
    records.each do |record|
      if (safe_id_checker[record['imageId']] == true)
        filtered_vision_api_json[file] << JSON.dump(record)
      end
    end
  end

  #write to file
  output_files.each_pair do |original_file, output_file|
    output_file.puts '['
    output_file.puts filtered_vision_api_json[original_file].join(",\n")
    output_file.puts ']'
    output_file.close
  end

end

#run
generate_vision_safe_data(safe_id_json_filepath: ARGV[0], vision_api_directorypath: ARGV[1])
