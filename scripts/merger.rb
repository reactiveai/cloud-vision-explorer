require 'json'

# f = File.open('/mnt/imagedisk/vision/vision_api.json', 'w')
f = File.open('/mnt/imagedisk/vision/vision_api.json', 'w')

records = []
Dir.glob('./x/*.json').each{|file|
  image_id = File.basename(file, '.json')
  record = JSON.parse(File.read(file)).first

  record['imageId'] = image_id
  records << JSON.dump(record)
}

f.puts '['
f.puts records.join(",\n")
f.puts ']'

f.close
