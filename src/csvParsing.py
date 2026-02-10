import json
import datetime
import sys

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
