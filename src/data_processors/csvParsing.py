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
#    print(i)
    js_time_stamp_ms = i['t']
    # js_time_stamp_s = js_time_stamp_ms
    # utc_date_time = datetime.datetime.utcfromtimestamp(js_time_stamp_s)
    # print(i['t'])
    # print(utc_date_time)
    # print('')

# Convert to CSV file
fout = open(sys.argv[1][:-3] + 'csv', 'w', newline='')
writer = csv.writer(fout)

# De Facto Headings
data_to_write = [['time', 'x', 'y', 'z', 'ang_vel_x', 'ang_vel_y', 'ang_vel_z'
                    'lin_vel_x', 'lin_vel_y', 'lin_vel_z',
                    'rotation_x', 'rotation_y', 'rotation_z',
                    'quaternion'
                  ]]

for location in data:
    timestamp = location['t']

    print(location['s'][0])

    # Stylus Point Location (x, y, z)
    stylus_x = location['s'][0]
    stylus_y = location['s'][1]
    stylus_z = location['s'][2]

    # Stylus Angular Velocity (x, y, y)
    stylus_ang_velo_x = location['a'][0]
    stylus_ang_velo_y = location['a'][1]
    stylus_ang_velo_z = location['a'][2]

    # Stylus Linear Velocity (x, y, z) 
    stylus_lin_velo_x = location['l'][0]
    stylus_lin_velo_y = location['l'][1]
    stylus_lin_velo_z = location['l'][2]

    # Stylus Rotation (_x, _y, _z) 
    # N.B Values isEuler and _order also recorded, but not put into .csv
    stylus_rotation_x = location['r'][0]
    stylus_rotation_y = location['r'][1]
    stylus_rotation_z = location['r'][2]
    
    # Stylus Quaternion
    stylus_quaternion = location['q']

    line = [timestamp,
            stylus_x, 
            stylus_y, 
            stylus_z,
            stylus_ang_velo_x,
            stylus_ang_velo_y,
            stylus_ang_velo_z,
            stylus_lin_velo_x,
            stylus_lin_velo_y,
            stylus_lin_velo_z,
            stylus_rotation_x,
            stylus_rotation_y,
            stylus_rotation_z,
            stylus_quaternion]

    data_to_write.append(line)

writer.writerows(data_to_write)

fout.close()
print(len(data_to_write) - 1)
print('Done!' + sys.argv[1][:-3] + 'csv')
