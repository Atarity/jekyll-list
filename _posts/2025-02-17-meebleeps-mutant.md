---
layout: post
title: "Meebleeps Mutant"
date: 2025-02-17 11:12:13 +0000
categories: synths

name: Meebleeps Mutant
author: Meebleeps
link: https://github.com/Meebleeps/MeeBleeps-Mutant-Synth
demo: https://www.youtube.com/watch?v=d2Lml1Z9uWc
pic: ../pics/meebleeps-mutant.jpg
description: "8-Bit 2-oscillator subtractive Arduino synth for generative techno, using Mozzi library, in Volca form-factor."
notes: "Synth Voice Features
- 2 saw oscillators
- Multiple tuning modes for 2nd oscillator - off, detune, fifths & octaves up/down
- Digital low pass filter with variable cutoff and resonance
- Variable level ducking/sidechain effect
Sequencer
- Generative sequencer mutates/evolves at user-defined rate
- Variable sequence mutation probability & note-density
- Variable sequencer length (1-16 steps)
- Sync input & output (Korg Volca compatible)
- Selectable tonic note
- Selectable scale quantisation (Major, Minor, Pentatonic, Phrygian (GOA!), Octaves, Fifths)
- 16-step parameter-lock recording of synth parameters (the Elektron way!)
- Retrig (clone) button for fills
- Tap-tempo control

More details in Reddit post ."
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
