# Investigation before email classification

Status: Accepted, 15 November 2026. Supersedes the Station 1 timing, content and binary scoring in ADR 0004.

## Context

Automatic independent case notes exposed mismatches before a Participant investigated anything. The binary scorer accepted a correct label without demonstrating understanding. Every legitimate message offered an independent-channel fallback, creating an editorial shortcut, and the same two Easy legitimate cases appeared in every scored deal. The user requested a more challenging game that teaches scam investigation and confirmed the rules below through grilling.

## Decision

Scored Rounds remain ten balanced messages (5 Phishing / 5 Legitimate with 2 Easy, 2 Medium and 1 Hard per class), now with a shared 120-second deadline. Each completed judgement contains a classification and one selected detail from the sender, subject, message, inspected destination or voluntarily opened verification record.

Award +10 only when both label and cited evidence are supported; award 0 for a correct label with unsupported evidence; deduct 10 for a wrong label; unanswered/draft judgements earn 0; floor the final total at 0. Best-Round aggregation and the existing server-duration tie-break remain unchanged. All-correct labels alone can no longer earn a positive score.

Verification is available equally for every case, hidden until deliberately opened, carries no score deduction and does not pause time. Destination inspection remains inert. Evidence affordances are provided for all ordinary fields, including weak details; correct clues are not preselected. Review distinguishes supported evidence from contextual details insufficient alone, explains the chosen evidence and teaches a safe next action.

Expand the bank to 32 cases, including paired messages with matching senders/subjects or even destinations but different actions/permission scopes. More Easy legitimate cases remove the fixed repeated pair. Vary deadlines, fees, attachments and independent-channel wording across both labels. The full-bank demo remains unscored for the event and normalizes its practice result to 100.

Use snapshot version2 to persist evidence drafts and voluntary-verification state. Old demos restart safely into the new exercise. Scored earlier-format Rounds retain their existing server records: staff can finish retry/hand over a saved result or cancel an unfinished old Round, rather than silently replacing its deadline or regrading it. Historical completed server scores are not rewritten.

## Consequences

The game measures inspection and justified decisions rather than binary recognition alone. Participants may need to read, inspect or verify before selecting a useful detail. Difficulty is increased by plausible paired cases and evidence quality, not ambiguous trick labels or a penalty for checking. The 120-second budget is an accepted operational choice and still needs event playtesting. Client-side cases and accepted evidence are visible to a deliberate source-code reader; this is an educational station, not a secure examination system.
