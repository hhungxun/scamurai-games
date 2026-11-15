# Phishing Fishing

Offline English phishing-awareness game for the XMUM Community Service booth. Open **index.html** in Edge, Chrome or Firefox. Keep this entire folder together. No installation, server or network connection is needed.

## Current rules

- Every round includes **all 20 emails**, shuffled into a new random order, without duplicates.
- One shared **60-second timer** starts when Start Game is pressed. Answer as many as you can. The round ends immediately at the deadline, or earlier if all 20 answers are submitted.
- Choose **Legitimate** or **Phishing**, or press **L / P**. No correctness feedback appears until the round ends.
- Final score out of 100 = **100 x min(answered / 10, 1) x (0.8 x correct / answered + 0.2)**, rounded once to one decimal. No answers means zero accuracy and zero score.
- Accuracy uses answered questions only. Scoring progress reaches 100% at 10 answers. You do not need to finish all 20 emails. Unattempted emails appear as Unanswered in the review and are separate from incorrect answers.
- Results show emails answered, accuracy, correct/wrong counts, time used, the score calculation and all 20 email explanations.
- New Player clears the previous round and restores the full timer. No names, results or personal data are saved.

| Answered | Correct | Accuracy | Target progress | Score / 100 |
| --- | --- | --- | --- | --- |
| 0 | 0 | 0% | 0% | 0 |
| 1 | 1 | 100% | 10% | 10 |
| 10 | 10 | 100% | 100% | 100 |
| 12 | 10 | 83.33% | 100% | 86.7 |
| 20 | 16 | 80% | 100% | 84 |
| 20 | 20 | 100% | 100% | 100 |

Accuracy has 80% weight and participation 20%. Both components are scaled by progress toward 10 answers so a single correct answer earns 10 points, not 81. Ten correct answers can earn 100; more than ten answers still affect accuracy. There is no time bonus.

## Booth controls

Hover, focus or tap a simulated link to inspect its destination. Enter/Space pins it; Escape closes the readout. These buttons never navigate. Attachments and QR codes are text labels only. All addresses use fictional .example domains.

How to verify lists reference institutions and independent verification habits. Its timer continues during a round; shortcuts do not answer behind the open dialog. Timeout closes the dialog automatically. The header home control works outside a live round. F11 or the full-screen button can help on the booth laptop.

The timer measures elapsed time, checks the deadline again on each submission and catches up after a sleeping laptop or background tab resumes. Duplicate clicks and held keys cannot submit twice; transitions take 320 ms. Desktop progress scrolls vertically and mobile progress scrolls horizontally to keep the current email visible.

## Settings and content

Edit config.js and reload:

```js
roundSeconds: 60,
targetAnswers: 10,
accuracyWeight: 80,
participationWeight: 20
```

Weights must be positive and add up to 100, with accuracy higher than participation. targetAnswers must be a positive integer no larger than the bank. The maximum score remains 100. The number of questions follows the entire bank, not a fixed sample.

emails.js contains 20 unique scenarios: 12 phishing and 8 legitimate. The original 16 scenarios remain, with four playful Easy scams teaching QR phishing, executable malware, wallet recovery-phrase theft and callback/remote-access refund fraud. Difficulty labels and classifications appear only in review; the category distribution is not displayed during play. See QUESTION_GUIDE.md for the full operator table.

Each email needs an ID, institution, classification, difficulty, objective, sender, subject, body, explanation and matching indicators. Body blocks are paragraph, detail, link or attachment. Link text and destination are separate fields. Indicators must be exact substrings of the corresponding sender, subject or body/URL field. Keep all addresses and URLs on reserved .example domains. Legitimate senders and destinations must use their reference institution's domain or its subdomains. Content is escaped before rendering.

## Verification

Run `node tests/core.test.cjs` for dependency-free checks. They cover the bank, 1,000 full-bank shuffles, all 231 answered/correct combinations, score rounding, zero answers, deadline clicks, duplicate/stale submissions, clock reversal, sleeping tabs, reset and invalid settings.

Run `node tests/browser.test.cjs` with an existing Playwright installation. Set PLAYWRIGHT_PATH and BROWSER_PATH if needed. It loads index.html directly offline, checks shared timing and weighted results, renders every scenario, verifies link/keyboard/touch controls and review highlights, and checks progress and overflow at five desktop/mobile sizes. No packages are needed to play.
