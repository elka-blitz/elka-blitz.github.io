# Usage

## Step 1
- Switch on BrainLink Pro headset by holding the logo button

## Step 2
Run
`sudo hcitool scan`
- Copy the MAC address of the headset

## Step 3
- Establish a connection with the headset


While switched on, run `sudo rfcomm connect <MAC address>`

Keep this process running - it is the connection to the headset.

To see raw bytestream: `sudo cat /dev/rfcomm0 | hexdump -C`

## Step 4
- Change to data_processors directory

### For real-time visualisation:
- Run `python3 realtime_plot.py --serial /dev/rfcomm0 --baud 115200`

### To store data to `.csv`
- Run `python3 main.py --serial /dev/rfcomm0 --baud 115200 --csv`