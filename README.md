# MedAssist 360

**MedAssist 360** is a premium, futuristic, AI-powered multilingual emergency triage, prescription understanding, and hospital navigation platform. Built as a world-class AI health product landing page for a hackathon-winning demo.

## Features Design
- **Cinematic Scroll Animation**: A 240-frame 3D object explosion rendered smoothly on scroll via a custom HTML5 `<canvas>` integration and interpolation (lerp).
- **Anti-gravity visual style** with elegant depth, layered motion, and ultra-minimal typography.
- **Glassmorphism** and deeply integrated CSS3 animations for a weightless, premium dark-mode user experience matching the central red-tinted 3D objects.
- Interactive JavaScript demo simulation predicting urgency levels, specialty, and nearest care facilities.
- Fully responsive on all devices adjusting the 3D scroll explosion via dynamic `object-fit: cover` calculations, without utilizing any external frameworks like Tailwind or Bootstrap. Pure HTML5, CSS3, and Vanilla JavaScript.

## Setup Instructions

1. Clone or download this repository.
2. Ensure the folder structure is intact:
   ```text
   medassist-360/
   │── index.html
   │── css/
   │   └── style.css
   │── js/
   │   └── script.js
   │── finalframes/      <-- 240-frame 3D sequence (.jpg sequence)
   │── assets/
   └── README.md
   ```
3. Open `index.html` in any modern web browser to view the application. No local web server is strictly required, though using one (like VS Code Live Server) will enable the smoothest rendering of fonts and relative paths.

## Technologies Used
- **HTML5**: Semantic tags, accessible structure, `<canvas>` 2D context for image sequence.
- **CSS3**: Custom properties (Variables) for color theming (Deep Red/Black), Grid, Flexbox, Keyframe Animations, Backdrop-filter for glassmorphism.
- **Vanilla JavaScript**: High-performance `requestAnimationFrame` scrubbing, mathematical lerp inertia, DOM Manipulation, Event Listeners, Intersection Observers for scroll reveal, and a simulated API delay for the interactive demo.

## Concept
The platform aims to solve critical gaps in emergency care:
- Symptom confusion
- Hard-to-read reports
- Delayed decisions
- Wrong hospital selection

Designed and built for startup impact.
