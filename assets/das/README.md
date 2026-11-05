# DAS media exhibit

Only HTML, CSS, JavaScript and rendered MP4/PNG media are published here. No raw H5 recordings, MATLAB/NumPy signal arrays, label arrays, or numerical dataset excerpts are included.

The exhibit uses the 5 May 2021 acquisitions, original channels 325–449, 500 Hz. Walking movies show saved MATLAB signals and matched event annotations. Gait is illustrative, not validated foot-contact timing or model inference.

The processing comparison displays the same forward passage: 45.056 seconds. Each movie starts with instrument-exported strain-rate input and reveals a processed result from left to right. It is pre-rendered, not in-browser signal processing.

`filter-0` through `filter-7` use 0.01–5, 0.01–10, 0.01–20, 0.01–30, 0.1–5, 1–5, 5–10, and 10–30 Hz. These are new third-order Butterworth bandpass filters (SOS, forward–backward) applied directly to H5 input with up to 120 seconds of context on either side. They are frequency choices from Fig. 4, not a reproduction of its exact original example.

Display: 128 ms RMS smoothing, 64 ms bins, each channel's 98th-percentile raw-input RMS as a shared reference for every band, and a common asinh brightness transfer. Values above that reference saturate. Different channels have independent references; brightness is not calibrated amplitude across channels. Labels and all processing provenance stay in the private local workspace.

Only the eight Fig. 4 frequency ranges are offered. Every comparison poster and first video frame uses the same raw-H5 RMS image. The walking dots use measured per-channel RMS, normalized for display; the gait is a deterministic illustrative cycle, not an inferred foot-contact sequence. Section 03 summarizes the paper abstract and sections 3.3 / 6, with original research figures and citation.

Walking interaction: custom play/pause, a source-time slider (6–42.9167 s), previous/next rendered frame, 0.5×/1×/2× source-time playback and a fiber-only view. The 24 fps movies are encoded at 2× source time; one frame advances 1/12 s of source time. Controls use only media timing constants, never signal or label arrays. The original soft fiber animation is retained: dot color and size follow normalized per-channel RMS, without added glow, bright cores or a dark strip. No synthetic contact flashes are added.
