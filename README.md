# Reachable

A hands-on **accessibility workshop kit** for classes, bootcamps and team trainings. Learners practice **WCAG 2.2 AA** in the browser (keyboard, ARIA, contrast, zoom, a 20-issue remediation workshop, a quiz and an audit checklist), then hand in a results summary. Facilitators get a ready-to-run session plan: see [WORKSHOP.md](WORKSHOP.md). No install, no accounts, and learner data never leaves their browser.

## Modules
1. **Keyboard and ARIA** – native `details`, `dialog`, a menu button, accessible form validation and a live key log.
2. **Contrast and zoom** – WCAG contrast checker with hue-preserving fixes, text size, 320px reflow, text spacing and color-vision filters.
3. **Fix the UI** – Before / After / Side by side sample with a tracker (progress is saved in `localStorage`).
4. **Quick quiz** – six questions with explanations; best score is saved.
5. **Audit report** – 25-criterion checklist; copy, download (`.md`) or print the result.
6. **My results** – learner name, takeaway, and a summary of progress to copy, download or print for the facilitator.

## Run it
Open `index.html` in a browser, or serve the folder: `python3 -m http.server 8000`.

## Test
`npm test` (no dependencies; runs contrast math checks and a wiring check that every element id used by the JS exists in the HTML).

## Deploy to GitHub Pages
Push to `main`, then set **Settings → Pages → Source: GitHub Actions**. The workflow in `.github/workflows/pages.yml` runs the tests on every push and pull request and deploys only from `main`.

## Structure
```
index.html          page markup
css/styles.css      themes (light, dark, high contrast) and layout
js/contrast.js      WCAG contrast math (browser + Node)
js/app.js           routing, widgets, tracker, audit
js/quiz.js          quick quiz
.github/workflows/  test + Pages deploy
tests/              Node tests
```

## Limits
This lab cannot replace testing with real assistive technology (NVDA, JAWS, VoiceOver, TalkBack).

## License
MIT
