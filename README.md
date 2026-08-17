# Home Exercise Timer

A simple, mobile-friendly, set-based home exercise timer. Static site — HTML, CSS, vanilla JS. No build step, no backend.

## Run it

Open `index.html` directly in a browser, or serve it locally:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## How it works

- **Saved Sets**: reusable groups of exercises with timing (exercise duration, rest, repeat count, set rest). Stored in `localStorage`. Two defaults are provided: "7 Minute Workout" and "Intense Cardio".
- **My Workout**: add saved sets together, adjust each set's repeat count, then Start Workout.
- **Timer**: one generic engine runs preparation → exercise → rest → ... → set rest → next set → complete, with voice announcements via the Web Speech API.

## Deploy

Push to GitHub and enable GitHub Pages on the repo — no build process required.
