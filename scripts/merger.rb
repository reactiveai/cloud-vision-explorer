#!/usr/bin/env ruby

require 'json'

types = [:safe, :unsafe, :broken]
levels = [:adult_level, :violence_level]
files = {}
ids = {}
records = {}

types.each do |type|
  files[type] = File.open("#{ARGV[0]}/vision_api_"+type.to_s+".json", 'w')
  ids[type] = File.open("#{ARGV[0]}/vision_api_"+type.to_s+"_ids.json", 'w')
  records[type] = []
end

counts = {}
levels.each do |level|
  counts[level] = {}
end

### For tracking adult_level and violence_level occurrence counts
def count_manage (count_obj, top_key, secondary_key)
  count_obj[top_key].key?(secondary_key)? count_obj[top_key][secondary_key] += 1: count_obj[top_key][secondary_key] = 1
end

Dir.glob("#{ARGV[0]}/result/*.json").each do |file|
  image_id = File.basename(file, '.json')

  record = JSON.parse(File.read(file)).first
  record['imageId'] = image_id

  begin
    #check adult & violence level 
    adult_level = record['safeSearchAnnotation']['adult']
    violence_level = record['safeSearchAnnotation']['violence']

    levels.each do |level|
      count_manage(counts, level, eval("#{level}"))
    end
    
    if ((adult_level == "VERY_UNLIKELY" or adult_level == "UNLIKELY") and 
        (violence_level == "VERY_UNLIKELY" or violence_level == "UNLIKELY"))
      records[:safe] << JSON.dump(record)
      ids[:safe].puts image_id
    else
      records[:unsafe] << JSON.dump(record)
      ids[:unsafe].puts image_id
    end 

  rescue
    records[:broken] << JSON.dump(record)
    ids[:broken].puts image_id
  end
end

files.each_pair do |type, file|
  file.puts '['
  file.puts records[type].join(",\n")
  file.puts ']'
  file.close
end

ids.each_value do |file|
  file.close
end

#print out results
puts "JSON file statistics"
types.each do |type|
  puts "##{type.to_s} files:" + records[type].size.to_s
end
puts "adult/violence item occurrence counts:"
levels.each do |level|
  puts level.to_s + counts[level].to_s
end


