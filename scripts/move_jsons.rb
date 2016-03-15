#!/usr/bin/env ruby

require 'json'
require 'fileutils'

raise "Usage:./move_jsons.rb unsafe_id_json_filepath broken_id_json_filepath" if ARGV.size != 2

def generate_json_filenames(filepath)
  open(filepath).read.split("\n").map{|id| id + ".json"}
end

def move_images(unsafe_id_json_filepath:, broken_id_json_filepath:)

  json_filenames = {}
  json_filenames[:unsafe] = generate_json_filenames(unsafe_id_json_filepath)
  json_filenames[:broken] = generate_json_filenames(broken_id_json_filepath)

  dir_path = {
    :src => "/mnt/imagedisk/vision/result",
    :dst => "/mnt/imagedisk/vision/result_removed",
  }

  
  #move unsafe files
  json_filenames[:unsafe].each do |filename|
    #move regular size image file
    FileUtils.mv(dir_path[:src] + "/" + filename, dir_path[:dst]) if File.exist?(dir_path[:src] + "/" + filename)
    #move its thumbnail
  end

  #move broken files
  json_filenames[:broken].each do |filename|
    #move regular size image file
    FileUtils.mv(dir_path[:src] + "/" + filename, dir_path[:dst]) if File.exist?(dir_path[:src] + "/" + filename)
  end

end

#run
move_images(unsafe_id_json_filepath: ARGV[0], broken_id_json_filepath: ARGV[1])

