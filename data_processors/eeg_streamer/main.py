
"""Live decoder entrypoint for Brainlink/MindWave packets.

This script integrates the decoder in `decode_brainlink.py` and can run
against a hexdump text file or live serial device.
"""
import sys
from datetime import datetime
import time
import argparse

try:
    import decode_brainlink as decoder
except Exception:
    decoder = None

def main():
    file_out = open('eeg_stream_' + str(datetime.now()).replace(' ', '_') + '.csv', 'w')
    parser = argparse.ArgumentParser(description='Main live decoder for Brainlink/MindWave')
    parser.add_argument('input', nargs='?', help='Path to hexdump text file to decode')
    parser.add_argument('--serial', '-s', help='Serial device (e.g. /dev/rfcomm0) to read live')
    parser.add_argument('--baud', '-b', type=int, default=57600, help='Baud rate for serial')
    parser.add_argument('--csv', action='store_true', help='Emit CSV: timestamp,raw,attention,meditation')
    args = parser.parse_args()

    if decoder is None:
        print('decode_brainlink module not found. Ensure decode_brainlink.py is next to main.py')
        sys.exit(1)

    try:
        if args.serial or not args.input:
            # live serial mode (default device if not specified)
            device = args.serial if args.serial else '/dev/rfcomm0'
            gen = decoder.stream_from_serial(device, args.baud)
            idx = 0
            for payload in gen:
                decoded = decoder.decode_payload(payload)
                ts = time.time()
                if args.csv:
                    raw = decoded['raw_samples'][0] if decoded['raw_samples'] else ''
                    att = decoded['attention'][0] if decoded['attention'] else ''
                    med = decoded['meditation'][0] if decoded['meditation'] else ''
                    print('{:.6f},{},{},{}'.format(ts, raw, att, med))
                    file_out.write('{:.6f},{},{},{}\n'.format(ts, raw, att, med))
                else:
                    print('Live Packet {}: payload_len={} ts={} decoded={}'.format(idx, len(payload), ts, decoded))
                idx += 1
        else:
            # decode from hexdump/text file
            path = args.input
            with open(path, 'r', encoding='utf-8') as f:
                text = f.read()
            data = decoder.parse_hexdump_text(text)
            packets = decoder.decode_stream(data)
            for idx, p in enumerate(packets):
                decoded = decoder.decode_payload(p)
                print('Packet {}: payload_len={} decoded={}'.format(idx, len(p), decoded))
    except KeyboardInterrupt:
        file_out.close()
        print('\nInterrupted, exiting')


if __name__ == '__main__':
    main()


