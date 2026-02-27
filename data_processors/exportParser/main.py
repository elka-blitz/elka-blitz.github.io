from csvParser import textToCsv
import sys

csv_parser = textToCsv()

print(sys.argv[1])

# For combination of data files
csv_parser.read_file(sys.argv[1])


# Write to csv
csv_parser.export_to_csv()
