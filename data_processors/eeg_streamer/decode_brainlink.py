#!/usr/bin/env python3
"""Decode MindWave/Brainlink-style packets from a hexdump text file.

Usage: python3 decode_brainlink.py sample_hexdump.txt
"""
import sys
import re
import argparse

try:
    import serial
except Exception:
    serial = None


def parse_hexdump_text(text):
    # Find all hex byte pairs in the hexdump (ignore offsets and ASCII)
    hex_pairs = re.findall(r"\b([0-9a-fA-F]{2})\b", text)
    return bytearray(int(h, 16) for h in hex_pairs)


def decode_stream(data):
    i = 0
    packets = []
    while i < len(data) - 1:
        # look for sync 0xAA 0xAA
        if data[i] == 0xAA and data[i + 1] == 0xAA:
            if i + 2 >= len(data):
                break
            payload_len = data[i + 2]
            start = i + 3
            end = start + payload_len
            if end >= len(data):
                break
            payload = data[start:end]
            checksum = data[end]
            calc = (~(sum(payload))) & 0xFF
            if calc == checksum:
                packets.append(payload)
                i = end + 1
            else:
                # checksum mismatch: skip one byte and continue searching
                i += 1
        else:
            i += 1
    return packets


def stream_from_serial(device, baud):
    if serial is None:
        raise RuntimeError("pyserial not available; install with 'pip install pyserial'")
    s = serial.Serial(device, baud, timeout=1)
    buf = bytearray()
    while True:
        b = s.read(1)
        if not b:
            continue
        buf.extend(b)
        # search for sync in buffer
        while True:
            idx = buf.find(b"\xAA\xAA")
            if idx == -1:
                # keep last byte if it's 0xAA to handle split sync
                if len(buf) > 2:
                    buf[:] = buf[-2:]
                break
            if idx + 3 > len(buf):
                # need length byte
                break
            payload_len = buf[idx + 2]
            total = 3 + payload_len + 1
            if idx + total > len(buf):
                break
            payload = bytes(buf[idx + 3: idx + 3 + payload_len])
            checksum = buf[idx + 3 + payload_len]
            calc = (~(sum(payload))) & 0xFF
            if calc == checksum:
                # consume up to end
                del buf[: idx + total]
                yield payload
            else:
                # corrupted, skip this sync byte and continue
                del buf[idx:idx + 1]
                continue


def decode_payload(payload):
    i = 0
    out = {}
    out['raw_samples'] = []
    out['attention'] = []
    out['meditation'] = []
    out['blink'] = []
    out['poorSignal'] = []
    out['eeg_power'] = []
    while i < len(payload):
        code = payload[i]
        if code == 0x02:  # poor signal
            i += 1
            if i < len(payload):
                out['poorSignal'].append(payload[i])
        elif code == 0x04:  # attention
            i += 1
            if i < len(payload):
                out['attention'].append(payload[i])
        elif code == 0x05:  # meditation
            i += 1
            if i < len(payload):
                out['meditation'].append(payload[i])
        elif code == 0x16:  # blink strength
            i += 1
            if i < len(payload):
                out['blink'].append(payload[i])
        elif code == 0x80:  # raw value
            i += 1
            if i < len(payload):
                length = payload[i]
                i += 1
                if i+length-1 < len(payload):
                    val = int.from_bytes(payload[i:i+length], byteorder='big', signed=True)
                    out['raw_samples'].append(val)
                    i += length-1
        elif code == 0x83:  # EEG power (9 * 3 bytes)
            i += 1
            if i < len(payload):
                length = payload[i]
                vals = []
                i += 1
                for _ in range(length // 3):
                    if i+2 < len(payload):
                        v = payload[i] << 16 | payload[i+1] << 8 | payload[i+2]
                        vals.append(v)
                        i += 3
                out['eeg_power'].append(vals)
                i -= 1
        else:
            # unknown or extended code; advance
            pass
        i += 1
    return out

def main():
    parser = argparse.ArgumentParser(description='Decode MindWave/Brainlink packets from hexdump or live serial')
    parser.add_argument('input', nargs='?', help='Path to hexdump text file. If omitted use --serial')
    parser.add_argument('--serial', '-s', help='Serial device (e.g. /dev/rfcomm0) to read live')
    parser.add_argument('--baud', '-b', type=int, default=57600, help='Baud rate for serial')
    parser.add_argument('--csv', action='store_true', help='Emit CSV: timestamp,raw,attention,...')
    args = parser.parse_args()

    if args.serial:
        try:
            gen = stream_from_serial(args.serial, args.baud)
        except Exception as e:
            print('Serial open error:', e)
            sys.exit(1)
        idx = 0
        import time
        for payload in gen:
            decoded = decode_payload(payload)
            ts = time.time()
            if args.csv:
                # simple CSV: timestamp, raw (first if present), attention, meditation
                raw = decoded['raw_samples'][0] if decoded['raw_samples'] else ''
                att = decoded['attention'][0] if decoded['attention'] else ''
                med = decoded['meditation'][0] if decoded['meditation'] else ''
                print('{:.6f},{},{},{}'.format(ts, raw, att, med))
            else:
                print('Live Packet {}: payload_len={} ts={} decoded={}'.format(idx, len(payload), ts, decoded))
            idx += 1
    else:
        if not args.input:
            print("Usage: {} <hexdump.txt>   or   {} --serial /dev/rfcomm0".format(sys.argv[0], sys.argv[0]))
            sys.exit(1)
        path = args.input
        with open(path, 'r', encoding='utf-8') as f:
            text = f.read()
        data = parse_hexdump_text(text)
        packets = decode_stream(data)
        for idx, p in enumerate(packets):
            decoded = decode_payload(p)
            print('Packet {}: payload_len={} decoded={}'.format(idx, len(p), decoded))

if __name__ == '__main__':
    main()
