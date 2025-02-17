---
layout: post
title: "Meebleeps Freaq FM"
date: 2025-02-17 11:12:14 +0000
categories: synths

name: Meebleeps Freaq FM
author: Meebleeps
link: https://github.com/Meebleeps/MeeBleeps-Freaq-FM-Synth
demo: https://www.youtube.com/watch?v=KD6IrcmMkoA
pic: /pics/meebleeps-freaq-fm.jpg
description: "Dual-Voice 2 operator 8-bit FM Arduino Synth with 2-track generative sequencer, Mozzi library, Volca form-factor."
notes: "Voices
- 2 independent FM voices
- 2-operator FM (for old-school prince of persia vibes! 😂)
- Multi-mode FM ratios - quantised, free-multiple, independent
- Multiple operator waveforms for carrier & modulator - Sine, Saw, Reverse Saw, Square, Noise, Off
- Modulation level controlled by Attack/Decay envelope and LFO per-voice
- Multiple LFO waveforms (same tables as the carrier oscillators) Sine, Saw, Reverse Saw, Square, Noise
Sequencer
- 2/1.5 track polymetric sequencer with up to 16 steps per track (Both tracks use same note sequence but can have different step-counts for polymetric phasing)
- Multiple generative algorithms - (semi)random notes, (semi)random runs, arpeggio, drone
- Sequence mutates/evolves at user-defined rate & note-density
- Selectable tonic, octave & scale quantisation (Major, Minor, Pentatonic, Phrygian (GOA!), Octaves, Fifths)
- Tap-tempo control
- Sync input & output (Korg Volca compatible)
- 16-step parameter-lock recording of synth parameters for track 1 (the Elektron way!)
"
artifacts:
  - Schematic: true
  - PCB: false
  - BOM: true
  - FW: true
  - Docs: false
  - Enclosure: true
tags: [Arduino,Digital,Monophonic,Sequencer]
level: Newbe
---

{{page.description}}

![{{page.name}}]({{page.pic}})

{{page.notes}}

### All DB data
- Name: **{{page.name}}**
- Author: **{{page.author}}**
- Link: [{{page.link}}]({{page.link}})
- Demo: [{{page.demo}}]({{page.demo}})
- Picture: [{{page.pic}}]({{page.pic}})
- Description: **{{page.description}}**
- Notes: **{{page.notes}}**
- Artifacts: **{{page.artifacts}}**
- Tags: **{{page.tags}}**
- Level: **{{page.level}}**
