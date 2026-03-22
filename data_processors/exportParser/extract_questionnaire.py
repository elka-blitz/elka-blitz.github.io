import sys
import os
import csv

questionnaire_answers = {}
raw_qs = []
q_headings = 'PID, tlx1_s1	,tlx2_s1	,tlx3_s1	,tlx4_s1	,tlx5_s1	,tlx6_s1	,tlx7_s1	,sam1_s1	,sam2_s1	,sam3_s1	,flow1_s1	,flow2_s1	,flow3_s1	,flow4_s1	,flow5_s1	,flow6_s1	,flow7_s1	,flow8_s1	,flow9_s1	,flow10_s1	,ux1_s1	,ux2_s1	,ux3_s1	,ux4_s1	,ux5_s1	,ux6_s1	,ux7_s1	,ux8_s1	,tlx1_s2	,tlx2_s2	,tlx3_s2	,tlx4_s2	,tlx5_s2	,tlx6_s2	,tlx7_s2	,sam1_s2	,sam2_s2	,sam3_s2	,flow1_s2	,flow2_s2	,flow3_s2	,flow4_s2	,flow5_s2	,flow6_s2	,flow7_s2	,flow8_s2	,flow9_s2	,flow10_s2	,ux1_s2	,ux2_s2	,ux3_s2	,ux4_s2	,ux5_s2	,ux6_s2	,ux7_s2	,ux8_s2	,tlx1_s3	,tlx2_s3	,tlx3_s3	,tlx4_s3	,tlx5_s3	,tlx6_s3	,tlx7_s3	,sam1_s3	,sam2_s3	,sam3_s3	,flow1_s3	,flow2_s3	,flow3_s3	,flow4_s3	,flow5_s3	,flow6_s3	,flow7_s3	,flow8_s3	,flow9_s3	,flow10_s3	,ux1_s3	,ux2_s3	,ux3_s3	,ux4_s3	,ux5_s3	,ux6_s3	,ux7_s3	,ux8_s3'

q_headings = q_headings.strip().split(',')

input_file = sys.argv[1]

fin = open(input_file, 'r')

csv_reader = csv.DictReader(fin)
for row in csv_reader:
    if row['Questionnaire Answers'] != 'NA':
        raw_qs.append(row['Questionnaire Answers'])

# Clean data

#Clear first one (duplicate)
#probably should keep the first one if there isn't 4 total
if len(raw_qs) > 3:
    del raw_qs[0]

#Translate array to csvstring
nondescriptindex = 0

for list_q in raw_qs:
    print('raw_qs', list_q)
    if '[' in list_q:
        translated_stringcast_array = ''
        for character in list_q:
            if character not in '[], ':
                translated_stringcast_array += character + ','

    
        translated_stringcast_array = translated_stringcast_array[:len(translated_stringcast_array) - 1]
        del raw_qs[nondescriptindex]
        raw_qs.insert(nondescriptindex, translated_stringcast_array)
    nondescriptindex += 1

print(raw_qs)

# Write data to formatted csv
fout = open(sys.argv[1].split('/task')[0] + 'questionnaire_answers_extracted_format' + sys.argv[1].split('.')[0].split('data_')[1] + '.csv', 'w')

writer = csv.writer(fout)
data_to_write = []

for question_round in raw_qs:
    q_vals = question_round.split(',')
    q_round = []
    for val in q_vals:
        q_round.append(val)
    data_to_write.append(q_round)

writer.writerows(data_to_write)

format_out = open(sys.argv[1].split('/task')[0] + 'headed_questionnaire_answers_extracted_format' + sys.argv[1].split('.')[0].split('data_')[1] + '.csv', 'w')

writer = csv.writer(format_out)
data_to_write = []

# Make the array array  a single array
singlerow = [sys.argv[1].split('/task')[0]]

for question_round in raw_qs:
    q_vals = question_round.split(',')
    for val in q_vals:
        singlerow.append(val)

writer.writerow(q_headings)    
writer.writerow(singlerow)

# Access cumulative file and add this line to it
cumulative_data_line_file = open('../data_collection.csv', 'a')


writer = csv.writer(cumulative_data_line_file)
writer.writerow(singlerow)

cumulative_data_line_file.close()
format_out.close()
fout.close()










