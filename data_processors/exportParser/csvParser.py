import datetime
import json
import sys
import csv

class textToCsv:
    def __init__(self):
        print('Text to CSV intialised')
        self.file_input = False
        self.json_contents = False
        self.stylus_data = False
        self.task_events = False
        self.eeg_data = False

        self.export_task_event_lines = []
        self.task_events_json = False

        self.export_stylus_data_lines = []
        self.stylus_data_json = []

        self.convert_line = []
        self.data_to_write = []
        self.task_csv_headings = ['PID', 'timestamp', 'connected', 'handedness', 'task', 'TTC', 'ACC', 'Questionnaire Answers']

        self.out_file = False
        self.writer = False
        self.input_file = False

    def read_file(self, input_file):
        self.input_file = input_file
        fin = open(input_file)
        self.file_input = fin.read()

        # File is read, can init writer, fout
        self.out_file = open(input_file[:-3] + 'csv', 'w', newline='')
        self.writer = csv.writer(self.out_file)


        stylus_data_fout = open(self.input_file[:-3] + 'extracted.csv', 'w', newline='')
        stylus_data_fout.close()

        if self.file_input:
            print('Converting from text to json')
            # Convert to json
            self.json_contents = json.loads(self.file_input)
            print(f'\nItems loaded: {len(self.json_contents)}\n')
            
        for data_object in self.json_contents:
            print(data_object)
            if 'stylus' in data_object:
                self.stylus_data = self.json_contents[data_object]
                print('Stylus data read')
            elif 'task' in data_object:
                self.task_events = self.json_contents[data_object]
                print('Task events read')

        fin.close()

    def checkForKey(self, key, event):
        try:
            print(event[key.lower()])
            self.convert_line.append(event[key.lower()])
            print('\033[92mONLINE\033[0m\n')
            return
        #  except KeyError:
            #  # Subcheck
            #  try:
                #  print(event[key.lower()][0])
        except KeyError:
            #  print('failed to find' + event[key.lower()])
            try:
                event_raw =  event['event']
                print('rawconversion:', event_raw)
                event_translate = ''
                if 'ControllerConnected' in event_raw:
                    self.convert_line.append('controller_connected')
                    print('\033[92mONLINE\033[0m\n')
                    return
                if 'Back' in event_raw:
                    self.convert_line.append('back_button')
                    print('\033[92mONLINE\033[0m\n')
                    print('Back Button')
                    return

                event_raw = ''
                self.convert_line.append('NA')

            except KeyError:
                print('\033[31mFAIL\033[0m\n')
                self.convert_line.append('NA')
                return

            print('\033[31mFAIL\033[0m\n')
            self.convert_line.append('NA')
            #  self.convert_line.append('NA')
        return None

    def export_to_csv(self):
        # Export whatever has been read
        if self.stylus_data:

            stylus_data_fout = open(self.input_file[:-3] + 'extracted.csv', 'w', newline='')
            stylus_data_writer = csv.writer(stylus_data_fout)

            print('Stylus data found')
            print(len(self.stylus_data))
            
            data_to_write = [['time', 'x', 'y', 'z', 'ang_vel_x', 'ang_vel_y', 'ang_vel_z',
                                'lin_vel_x', 'lin_vel_y', 'lin_vel_z',
                                'rotation_x', 'rotation_y', 'rotation_z',
                                'quaternion'
                              ]]

            self.stylus_data_json = json.loads(self.stylus_data)

            for location in self.stylus_data_json:
                timestamp = location['t']
                #  print(timestamp)
            
                #  print(location['s'][0])
            
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
            
                self.export_stylus_data_lines.append(line)
                print(self.export_stylus_data_lines)
            
            stylus_data_writer.writerows(data_to_write)
            stylus_data_writer.writerows(self.export_stylus_data_lines)
            stylus_data_fout.close() 
            print(len(data_to_write) - 1)
            print('Done!' + sys.argv[1][:-3] + 'csv')

        if self.task_events:
            print('Task event data found')
            print('Writing headers (PID, HND, TSK, TTC, ACC, ANS')
            
            self.export_task_event_lines.append(self.task_csv_headings)

            # Convert to JSON
            self.task_events_json = json.loads(self.task_events)

            print(self.task_events)
                
            # Categorise every event
            # TODO Replace magic strings, or optimise
            for event in self.task_events_json:
                for col in self.task_csv_headings:
                    if col == 'PID':
                        self.convert_line.append('NA') # Not implemented in export

                    elif col == 'timestamp':
                        self.convert_line.append(event['timestamp'])

                    elif col == 'connected':
                        if 'Connected' in event['event']:
                            self.convert_line.append(event['event'].split(' ')[0])
                        else:
                            self.convert_line.append('NA')

                    elif col == 'handedness':
                        if 'Connected' in event['event']:
                            self.convert_line.append(event['event'].split('=')[1])
                        else:
                            self.convert_line.append('NA')

                    elif col == 'task':
                        if 'task' in event['event']:
                            self.convert_line.append(event['event'].split('_')[0][-1:])
                        else:
                            self.convert_line.append('NA')

                    elif col == 'TTC':
                        self.convert_line.append('NA') # Not implemented yet
                        # TODO TTC calculation
                    elif col == 'ACC':
                        self.convert_line.append('NA') # Not present in export yet

                    elif col == 'Questionnaire Answers':
                        if '[' in str(event):
                            print(event['event'])
                            self.convert_line.append(event['event'])
                        else:
                            self.convert_line.append('NA')
                    

                self.data_to_write.append(self.convert_line)
                self.convert_line = [] # Clear

            # Write all lines to file 
            self.writer.writerow(self.task_csv_headings)
            self.writer.writerows(self.data_to_write)

            print('Done!' + sys.argv[1][:-3] + 'csv')

             
