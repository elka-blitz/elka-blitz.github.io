# Brainlink Pro / NeuroSky MindWave Data Format

## Packet Structure
Each packet follows this format:
```
[0xAA] [0xAA] [Length] [Payload...] [Checksum]
  ↑      ↑        ↑         ↑          ↑
 Sync   Sync   PayloadLen  Data      Verify
```

---

## Decoded Fields

### Raw EEG Sample (0x80)
- **What it is**: Raw electrical brain activity (waveform)
- **Data type**: 16-bit signed integer
- **Units**: Microvolts (µV)
- **Range**: Typically -2048 to +2047 µV (but can exceed)
- **Frequency**: ~512 Hz sampling rate
- **Use**: Direct EEG signal; can be filtered/analyzed for detailed brain activity patterns
- **Example from your data**: `[39, 80, 97, 52, 16, 55, -19, ...]`

---

### Attention (0x04)
- **What it is**: Mental focus/concentration level
- **Data type**: 0–100 (single byte)
- **Range**: 
  - 0–40: Unfocused
  - 40–60: Neutral
  - 60–100: Highly focused
- **Frequency**: Sent periodically (~1 Hz)
- **Use**: Assess user's mental engagement
- **Example from your data**: `[43]` = focused state

---

### Meditation (0x05)
- **What it is**: Relaxation/calmness level
- **Data type**: 0–100 (single byte)
- **Range**:
  - 0–40: Busy/stressed
  - 40–60: Neutral
  - 60–100: Very relaxed
- **Frequency**: Sent periodically (~1 Hz)
- **Use**: Assess user's relaxation
- **Example from your data**: `[38]` = relaxed state

---

### Poor Signal (0x02)
- **What it is**: Signal quality indicator
- **Data type**: 0–200 (single byte)
- **Range**:
  - 0: Excellent contact
  - 1–50: Good signal
  - 51–100: Fair signal
  - 101–200: Poor/no signal
- **Frequency**: Sent regularly (~1 Hz)
- **Use**: Diagnose electrodes contact problems
- **Example from your data**: `[0]` = perfect contact

---

### Blink Strength (0x16)
- **What it is**: Eye blink detection and strength
- **Data type**: 0–255 (single byte)
- **Range**:
  - 0: No blink
  - 1–100: Weak blink
  - 101–255: Strong blink
- **Frequency**: Only sent when a blink is detected
- **Use**: Eye movement tracking, blink-triggered events

---

### EEG Power Spectrum (0x83)
- **What it is**: Brainwave power in 8 frequency bands
- **Data type**: 3 bytes per band = 24 bytes total (8 bands × 3 bytes)
- **Bands (in Hz)**:
  1. **Delta** (0.5–3 Hz): Deep sleep, unconscious processes
  2. **Theta** (4–7 Hz): Deep meditation, creativity
  3. **Low Alpha** (8–9 Hz): Relaxed awareness
  4. **High Alpha** (10–12 Hz): Relaxation, meditation
  5. **Low Beta** (13–17 Hz): Focused, logical thinking
  6. **High Beta** (18–30 Hz): Alertness, anxiety
  7. **Low Gamma** (31–40 Hz): Cognitive processing
  8. **Mid Gamma** (41–50 Hz): Problem solving
- **Format**: Each band is stored as 24-bit unsigned integer (3 bytes, big-endian)
- **Frequency**: Sent periodically (~1 Hz)
- **Example from your data**:
  ```
  'eeg_power': [[166186, 42383, 7069, 5434, 841, 6617, 7977, 281]]
  ```
  This means:
  - Delta power: 166186
  - Theta power: 42383
  - Low Alpha: 7069
  - High Alpha: 5434
  - Low Beta: 841
  - High Beta: 6617
  - Low Gamma: 7977
  - Mid Gamma: 281

---

## Practical Interpretation

### Normal Session Example
```
Raw samples:    [-348, -252, -57, 102, 168, ...]          # Raw EEG waveform
Attention:      [43]                                       # User is focused
Meditation:     [38]                                       # User is relaxed
PoorSignal:     [0]                                        # Excellent electrode contact
EEG Power:      Delta↓, Theta↑, Alpha↑, Beta↓            # Relaxed but aware state
```

### What This Tells You
- **Device is working**: Raw samples streaming continuously ✓
- **Good contact**: PoorSignal = 0 ✓
- **User state**: High Attention + High Meditation = Focused relaxation (flow state)
- **Brain activity**: High Theta/Alpha = meditative/creative state; Low Beta = not anxious

---

## Quality Checks

| Check | Good | Bad |
|-------|------|-----|
| Raw samples streaming | Continuous non-zero values | All zeros / stuck values |
| PoorSignal | 0–50 | > 100 |
| Attention/Meditation | Both present in stream | Only one or missing |
| EEG Power | Multiple large bands | All zeros or one band dominant |

---

## Next Steps

1. **Live visualization**: Run `realtime_plot.py` to see these values update in real-time
2. **Data logging**: Use `main.py --csv` to record and analyze trends
3. **Filtering**: Process raw samples through digital filters (e.g., 0.5–50 Hz bandpass) to reduce noise
4. **Feature extraction**: Calculate additional metrics like power ratios (Alpha/Beta), coherence, etc.
