import json
import datetime                
import sys
import csv
  
# Pass file to convert to csv as CLI argument

filename = sys.argv[1]

fin = open(filename, 'r')

fin = fin.read()
# Json_string

data = json.loads(fin)

for i in data:
    print(i)
    js_time_stamp_ms = i['t']
    js_time_stamp_s = js_time_stamp_ms
    utc_date_time = datetime.datetime.utcfromtimestamp(js_time_stamp_s)
    print(i['t'])
    print(utc_date_time)
    print('')

# Convert to CSV file
fout = open(sys.argv[1][:-3] + 'csv', 'w', newline='')
writer = csv.writer(fout)

data_to_write = [['time', 'x', 'y', 'z']]

for location in data:
    timestamp = location['t']
    x = location['s']['x']
    y = location['s']['y']
    z = location['s']['z']
    
    line = [timestamp, x, y, z]

    data_to_write.append(line)

writer.writerows(data_to_write)

