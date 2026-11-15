# Desktop station ownership and email scoring

Status: Accepted, 15 November 2026.

## Context

Stations 1 and 2 have two or more laptops at one Game Master's station. Participants must choose their own registered identity, play independently and hand over to the next Participant. The incoming phishing branch was entirely offline, lost its timer/answers on refresh, and awarded 68/100 for blindly answering Phishing to its full bank. Its participation component awarded 20 even for all-wrong answers; continuing after ten could reduce a previously perfect score.

## Decision

The user confirmed Phishing Fishing as Station 1 and scored Rounds of ten emails, five Phishing and five Legitimate, with a shared 60-second timer. Both classifications use 2 Easy, 2 Medium and 1 Hard messages. Correct answers earn ten, wrong answers deduct ten, unanswered earn zero, final total floored at zero. Full completion with one label earns zero; all correct earns 100. Demo/practice uses all twenty messages and cannot submit event data.

Keep the existing shared registration and one-active-Round-per-Participant-per-Station backend. Each laptop owns a separate selected identity and durable game snapshot. Staff authenticate once per browser; Participants select existing registered names/IDs. The email game uses a shared desktop parent host and a validated resumable game core. The popup game keeps its specialized multi-document host. Both isolate demo storage and preserve the original absolute gameplay deadline through reload.

The parent freezes the displayed final score before API submission; save retries always reuse the same server Round and score. Pending finishes prevent a new Participant or cancellation. Preserve the server's existing time tie-break, including briefing and save time, instead of creating new timing fields.

## Consequences

This supports concurrent Participants without splitting one Station into several station numbers or adding usernames. It preserves best-Round aggregation, survey and personal-page behavior. Wrong-answer penalties remove guaranteed positive guessing credit, though random partial guessing can still yield chance credit after the zero floor. Balanced difficulty mixes reduce variation without claiming empirically equal difficulty or station score distributions. Sixty seconds remains a brisk reading task and needs participant playtesting. Public demos rehearse the actual interaction without requiring credentials or contaminating event scores.

Alternatives were retaining the offline game's participation formula, scoring all twenty messages, and using a single Game Master dashboard for phone play. The user explicitly selected ten balanced messages and independent booth laptops.
