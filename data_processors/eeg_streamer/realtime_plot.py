#!/usr/bin/env python3
"""Real-time visualization for Brainlink/MindWave decoded packets.

Usage examples:
  python3 realtime_plot.py --serial /dev/rfcomm0 --baud 115200
  python3 realtime_plot.py --sample sample_hexdump.txt

Requirements: matplotlib, pyserial (for live serial).
Install: pip3 install matplotlib pyserial
"""
import argparse
import collections
import threading
import time

try:
    import matplotlib.pyplot as plt
    from matplotlib.animation import FuncAnimation
except Exception:
    plt = None

try:
    import decode_brainlink as decoder
except Exception:
    decoder = None


def reader_thread_from_serial(device, baud, out_queue, stop_event):
    gen = decoder.stream_from_serial(device, baud)
    for payload in gen:
        if stop_event.is_set():
            break
        out_queue.append((time.time(), decoder.decode_payload(payload)))


def reader_thread_from_sample(path, out_queue, stop_event, delay=0.02):
    # Read hexdump and simulate streaming
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    data = decoder.parse_hexdump_text(text)
    packets = decoder.decode_stream(data)
    for payload in packets:
        if stop_event.is_set():
            break
        out_queue.append((time.time(), decoder.decode_payload(payload)))
        time.sleep(delay)


def run_plot(device=None, baud=57600, sample=None, window=500):
    if plt is None or decoder is None:
        raise RuntimeError('matplotlib or decode_brainlink not available')

    # Buffers
    times = collections.deque(maxlen=window)
    raw_buf = collections.deque(maxlen=window)
    att_buf = collections.deque(maxlen=window)
    med_buf = collections.deque(maxlen=window)
    poor_buf = collections.deque(maxlen=window)

    data_queue = collections.deque()
    stop_event = threading.Event()

    # start reader thread
    if sample:
        th = threading.Thread(target=reader_thread_from_sample, args=(sample, data_queue, stop_event))
    else:
        th = threading.Thread(target=reader_thread_from_serial, args=(device, baud, data_queue, stop_event))
    th.daemon = True
    th.start()

    fig, axs = plt.subplots(3, 1, figsize=(8, 6), sharex=True)
    ax_raw, ax_att, ax_poor = axs

    line_raw, = ax_raw.plot([], [], '-', lw=1)
    line_att, = ax_att.plot([], [], '-o', lw=1, ms=3)
    line_med, = ax_att.plot([], [], '-x', lw=1, ms=3)
    line_poor, = ax_poor.plot([], [], 'r-', lw=1)

    ax_raw.set_ylabel('Raw')
    ax_att.set_ylabel('Attention/Med')
    ax_poor.set_ylabel('PoorSignal')
    ax_poor.set_xlabel('Samples')


    def update_frame(frame):
        # drain queue
        while data_queue:
            ts, decoded = data_queue.popleft()
            times.append(ts)
            raw = decoded['raw_samples'][0] if decoded['raw_samples'] else None
            att = decoded['attention'][0] if decoded['attention'] else None
            med = decoded['meditation'][0] if decoded['meditation'] else None
            poor = decoded['poorSignal'][0] if decoded['poorSignal'] else None
            raw_buf.append(raw if raw is not None else 0)
            att_buf.append(att if att is not None else float('nan'))
            med_buf.append(med if med is not None else float('nan'))
            poor_buf.append(poor if poor is not None else float('nan'))

        if not times:
            return line_raw, line_att, line_med, line_poor

        # x-axis as sample index
        x = list(range(len(raw_buf)))
        line_raw.set_data(x, list(raw_buf))
        line_att.set_data(x, list(att_buf))
        line_med.set_data(x, list(med_buf))
        line_poor.set_data(x, list(poor_buf))

        ax_raw.relim(); ax_raw.autoscale_view()
        ax_att.relim(); ax_att.autoscale_view()
        ax_poor.relim(); ax_poor.autoscale_view()

        return line_raw, line_att, line_med, line_poor

    ani = FuncAnimation(fig, update_frame, interval=50, blit=False)

    try:
        plt.show()
    finally:
        stop_event.set()
        th.join(timeout=1.0)


def main():
    parser = argparse.ArgumentParser(description='Realtime plot of Brainlink data')
    parser.add_argument('--serial', '-s', help='Serial device (default /dev/rfcomm0)')
    parser.add_argument('--baud', '-b', type=int, default=57600)
    parser.add_argument('--sample', help='Sample hexdump text file to simulate live input')
    parser.add_argument('--window', type=int, default=500, help='Plot window size (samples)')
    args = parser.parse_args()

    device = args.serial if args.serial else '/dev/rfcomm0'
    try:
        run_plot(device=device, baud=args.baud, sample=args.sample, window=args.window)
    except Exception as e:
        print('Error:', e)


if __name__ == '__main__':
    main()
