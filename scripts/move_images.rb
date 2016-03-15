#!/usr/bin/env ruby

require 'json'
require 'fileutils'

raise "Usage:./move_images.rb unsafe_id_json_filepath broken_id_json_filepath" if ARGV.size != 2

def generate_json_filenames(filepath)
  open(filepath).read.split("\n").map{|id| id + ".jpg"}
end

def move_images(unsafe_id_json_filepath:, broken_id_json_filepath:)

  json_filenames = {}
  json_filenames[:unsafe] = generate_json_filenames(unsafe_id_json_filepath)
  json_filenames[:broken] = generate_json_filenames(broken_id_json_filepath)

  dir_path = {
    :image => "/mnt/imagedisk/image/",
    :thumbnail => "/mnt/imagedisk/thumbnail/",
    :removed => "/mnt/imagedisk/removed/",
    :removed_thumbnail => "/mnt/imagedisk/removed_thumbnail/",
    :removed_broken => "/mnt/imagedisk/removed/broken/",
    :removed_thumbnail_broken => "/mnt/imagedisk/removed_thumbnail/broken/"
  }

  thumbnail_size = ["32x32", "64x64", "128x128"]

  #move unsafe files
  json_filenames[:unsafe].each do |filename|
    #move regular size image file
    FileUtils.mv(dir_path[:image]+filename, dir_path[:removed]) if File.exist?(dir_path[:image]+filename)
    #move its thumbnail
    thumbnail_size.each do |size|
      FileUtils.mv(dir_path[:thumbnail] + size + "/" + filename, dir_path[:removed_thumbnail] + size + "/") if File.exist?(dir_path[:thumbnail] + size + "/" + filename)
    end
  end

  #move broken files
  json_filenames[:broken].each do |filename|
    #move regular size image file
    FileUtils.mv(dir_path[:image]+filename, dir_path[:removed_broken]) if File.exist?(dir_path[:image]+filename)
    #move its thumbnail
    thumbnail_size.each do |size|
      FileUtils.mv(dir_path[:thumbnail] + size + "/" + filename, dir_path[:removed_thumbnail_broken] + size + "/") if File.exist?(dir_path[:thumbnail] + size + "/" + filename)
    end
  end

end

#run
move_images(unsafe_id_json_filepath: ARGV[0], broken_id_json_filepath: ARGV[1])

