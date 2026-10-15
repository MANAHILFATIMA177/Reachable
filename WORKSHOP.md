# Facilitator guide: Reachable in 90 minutes

**Audience:** students or developers with basic HTML. **Setup:** each learner has a laptop and a browser. Show the lab on a projector, or let learners open the GitHub Pages link.

**By the end, learners can:** operate a page by keyboard only, explain why native HTML beats ARIA, check color contrast against WCAG, find and fix 13 common failures in a sample page, and name the limits of simulation versus real assistive technology.

## Agenda
| Min | Activity | Module |
|---|---|---|
| 0-10 | Why this matters. Ask: "Who has used a site with the mouse unplugged?" | none |
| 10-30 | Mouse away. Learners do every widget by keyboard, watching the key log. | Keyboard and ARIA |
| 30-45 | Contrast checker, then zoom to 400% and try the color-vision filters. | Contrast and zoom |
| 45-70 | Pairs: find issues in the Before sample, tick *Found*, then compare with After. | Fix the UI |
| 70-80 | Individual quiz, then review wrong answers aloud. | Quick quiz |
| 80-90 | Fill in My results and send it to you. | My results |

## Discussion prompts
- The dialog returns focus to its button on close. What happens to a screen reader user if it doesn't?
- Why is `#767676` on white the lightest gray that passes? What breaks if a designer picks `#777`?
- The Before sample looks fine to a mouse user. Which failures would you never notice without testing?
- When is `aria-label` the right fix, and when is it hiding a missing label?

## Facilitator tips
- Run the keyboard module first: the "aha" is strongest before learners read any theory.
- Issues 14-20 are page-level and not visible in the sample. Use them as homework on a real site.
- The audit checklist suits a take-home assignment: audit one real page and bring the exported report.
- Remind learners the lab simulates; real testing needs NVDA, JAWS, VoiceOver or TalkBack.

## Collecting results
Learners use **My results** to copy or download a short summary (name, issues found and fixed, best quiz score, criteria rated, and a takeaway). Ask them to paste it into your LMS or email it. Progress is stored in each learner's own browser, so a shared computer should use **Reset progress** between sessions.
