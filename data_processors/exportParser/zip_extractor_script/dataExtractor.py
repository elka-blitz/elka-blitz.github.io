import csv
import json
import os
import subprocess
import sys
import zipfile

class dataExtractor:
    def __init__(self, zip_archive):
        print(zip_archive)
        self.task_event_lines = []
        self.result = False
        self.zip_archive_path = zip_archive
        self.filenames = []
        self.json_object = False
        self.raw_data_file = False
        self.dirnames = []
        self.stylus_data = False
        self.task_data = False
        self.questionnaire_data_array = []
        self.q_headings = 'PID, tlx1_s1	,tlx2_s1	,tlx3_s1	,tlx4_s1	,tlx5_s1	,tlx6_s1	,tlx7_s1	,sam1_s1	,sam2_s1	,sam3_s1	,flow1_s1	,flow2_s1	,flow3_s1	,flow4_s1	,flow5_s1	,flow6_s1	,flow7_s1	,flow8_s1	,flow9_s1	,flow10_s1	,ux1_s1	,ux2_s1	,ux3_s1	,ux4_s1	,ux5_s1	,ux6_s1	,ux7_s1	,ux8_s1	,tlx1_s2	,tlx2_s2	,tlx3_s2	,tlx4_s2	,tlx5_s2	,tlx6_s2	,tlx7_s2	,sam1_s2	,sam2_s2	,sam3_s2	,flow1_s2	,flow2_s2	,flow3_s2	,flow4_s2	,flow5_s2	,flow6_s2	,flow7_s2	,flow8_s2	,flow9_s2	,flow10_s2	,ux1_s2	,ux2_s2	,ux3_s2	,ux4_s2	,ux5_s2	,ux6_s2	,ux7_s2	,ux8_s2	,tlx1_s3	,tlx2_s3	,tlx3_s3	,tlx4_s3	,tlx5_s3	,tlx6_s3	,tlx7_s3	,sam1_s3	,sam2_s3	,sam3_s3	,flow1_s3	,flow2_s3	,flow3_s3	,flow4_s3	,flow5_s3	,flow6_s3	,flow7_s3	,flow8_s3	,flow9_s3	,flow10_s3	,ux1_s3	,ux2_s3	,ux3_s3	,ux4_s3	,ux5_s3	,ux6_s3	,ux7_s3	,ux8_s3'

        # PID, Handedness, Task, Shape, Pen-down, Pen-up, Accuracy
        self.PID = False
        self.handedness = False
        self.task = False
        self.shape = False
        self.pen_down = False
        self.pen_up = False
        self.accuracy_score = False
        self.event_timestamp = False

        self.questionnaire_line_data = []
        self.cumulative_data_lines = []

        # Clear old zips on init
        for file in os.listdir(os.getcwd()):
            if file[0] == 'p':
                self.runrm('rm', file)
                self.runrmdir(file)
            
            # Also clear previous unzipped dirs
            

        self.unzip() # First unzip

        # Unzip subdirs
        for file in os.listdir(os.getcwd()):
            if len(file) < 8 and ('p' in file) and file.endswith('.zip'):
                self.filenames.append(file.replace('.zip', ''))
                temppathstore = self.zip_archive_path
                self.zip_archive_path = file
                self.unzip()
                self.zip_archive_path = temppathstore
        print('Loaded datapoints: ', len(self.filenames))

        # Go through each pdir
        # Open each txt file
        # Get the task data object

        for file in self.filenames:
            self.dirnames.append(os.path.join(os.getcwd(), file))
        print(self.dirnames)

        for pdir in self.dirnames:
            for data_file in os.listdir(pdir):
                if data_file.endswith('.txt'):
                    self.raw_data_file = open(os.path.join(os.getcwd(), pdir, data_file))

                    contents = self.raw_data_file.read()

                    json_load = json.loads(contents)
                    for item in json_load:
                        if 'task' in item:
                            self.task_data = json.loads(json_load[item])
                            questionnaire_answer_single = []
                            questionnaire_coll_count = 0
                            for event in self.task_data:
                                if 'button_pressed' in event['event']:
                                    # print(f'\033[94m{event}\033[0m')
                                    self.pen_down = True

                                elif 'button_released' in event['event']:
                                    self.pen_down = False

                                elif 'handedness' in event['event']:
                                    self.handedness = event['event'].split('=')[1]

                                

                                # print(f'\033[94m{event}\033[0m')




                                # print(event)
                                elif 'questionnaire1' in event['event']:
                                    # print(event['event'])
                                    split_export_string = str(event['event'])
                                    split_export_string = split_export_string.split('_')[1]

                                    for value in split_export_string:
                                        if value.isdigit():
                                            questionnaire_answer_single.append(value)
                                
                                elif 'questionnaire3' in event['event']:
                                    # print(event['event'])
                                    split_export_string = str(event['event'])
                                    split_export_string = split_export_string.split('_')[1]

                                    for value in split_export_string:
                                        if value.isdigit():
                                            questionnaire_answer_single.append(value)

                                elif '[' in str(event['event']):
                                    # print(event['event'])
                                    split_export_string = str(event['event'])
                                    for value in split_export_string:
                                        if value.isdigit():
                                            questionnaire_answer_single.append(value)

                                elif 'complete' in event['event']:
                                    self.task = event['event'].split('_')[0]

                                elif 'Accuracy' in event['event']:
                                    self.accuracy_score = event['event'].split(':')[1]
                                    # May need to reset this once written

                                elif 'Back' not in event['event'] and 'question' not in event['event']:
                                    self.shape = event['event'].split('_beg')[0]
                                    # Shapes condition (everything else)
                                # if 'question' in event['event'] or '[' in str(event['event']):
                                    # self.questionnaire_data_array.append(event['event'])
                                    # print(self.questionnaire_data_array)
                            
                                # if len(self.questionnaire_data_array) == 4:
                                    # del self.questionnaire_data_array[0]
                             
                                # print(self.pen_down)
                                self.event_timestamp = event['timestamp']
                                self.PID = 'p_' + pdir.split('/p')[1]
                                self.formLine()
                                self.accuracy_score = False

                            # print('questanssing', questionnaire_answer_single)
                            question_total = len(questionnaire_answer_single)
                            print(questionnaire_answer_single)

                            print('\n', pdir)
                            if question_total == 84:
                                print('\033[92m84\033[0m')
                            else:
                                questionnaire_answer_single = []
                                # Sigh. One single exception in datasoup
                                for item in json_load:
                                    if 'task' in item:
                                        self.task_data = json.loads(json_load[item])
                                        questionnaire_answer_single = []
                                        questionnaire_coll_count = 0
                                        for event in self.task_data:

                                            # print(event)
                                            if 'questionnaire1' in event['event']:
                                                # print(event['event'])
                                                split_export_string = str(event['event'])
                                                split_export_string = split_export_string.split('_')[1]

                                                for value in split_export_string:
                                                    if value.isdigit():
                                                        questionnaire_answer_single.append(value)
                                                    # print(event)

                                            if 'questionnaire2' in event['event']:
                                                # print(event['event'])
                                                split_export_string = str(event['event'])
                                                split_export_string = split_export_string.split('_')[1]

                                                for value in split_export_string:
                                                    if value.isdigit():
                                                        questionnaire_answer_single.append(value)

                                            
                                            if 'questionnaire3' in event['event']:
                                                # print(event['event'])
                                                split_export_string = str(event['event'])
                                                split_export_string = split_export_string.split('_')[1]

                                                for value in split_export_string:
                                                    if value.isdigit():
                                                        questionnaire_answer_single.append(value)
                                question_total = len(questionnaire_answer_single)

                                self.cumulative_data_lines.append(questionnaire_answer_single)

                                print(f'\033[93m{question_total}\033[0m')
            print(f'\033[92m{questionnaire_answer_single}\033[0m')                 
            print(f'\033[94mp_{pdir.split('/p')[1]}\033[0m')
            headed_oneline = ['p_' + pdir.split('/p')[1]]

            for i in questionnaire_answer_single:
                headed_oneline.append(i)

            if 'p' in headed_oneline[0]:
                self.cumulative_data_lines.append(headed_oneline)
                   # print(f'\nItems loaded: {len(self.json_object)}\n')
#                    for data_object in contents:
#                        print('dataobj', data_object)
#                        if 'stylus' in data_object:
#                            self.stylus_data = contents[data_object]
#                        if 'task' in data_object:
#                            self.task_data = contents[data_object]
#                            print(self.task_data)
#
             

        print(self.cumulative_data_lines)

        # Write self.cumulative_data_lines


        self.q_headings = self.q_headings.strip().split(',')

        with open('all_participant_answers.csv', 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(self.q_headings)
            writer.writerows(self.cumulative_data_lines)

        with open('task_event_raw.csv', 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['timestamp', 'PID', 'hand', 'taskno', 'shape', 'pen_down', 'accuracy'])
            writer.writerows(self.task_event_lines)

                    
            # print(self.task_event_lines) 
        # Obtain the task data
        # PID, Handedness, Task, Shape, Pen-down, Pen-up, Accuracy

#    def textToJson(self, file):
#        self.json_object = 
#        return 

        # self.PID = False
        # self.handedness = False
        # self.task = False
        # self.shape = False
        # self.pen_down = False
        # self.pen_up = False
        # self.accuracy_score = False

    def formLine(self):
        line_to_save = [self.event_timestamp, self.PID, self.handedness, self.task, self.shape, self.pen_down, self.accuracy_score]
        self.task_event_lines.append(line_to_save)

    def runrmdir(self, dirname):
        self.result = subprocess.run(['rm', '-Rv', dirname], text=True)

    def runrm(self, command_to_run, file):
        self.result = subprocess.run([command_to_run, file], text=True)

    def unzip(self):
        self.result = subprocess.run(['unzip', self.zip_archive_path], stdout=subprocess.PIPE, text=True)
        print('std>' + self.result.stdout) 
