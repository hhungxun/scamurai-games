# Scamurai

The event-day system for Scamurai, an anti-scam awareness event (Thu 26 Nov 2026, A3 G-floor, XMUM). Visitors register, play five booth games, and leave through an exit survey.

## Language

### People

**Participant**:
A visitor who plays the games, identified by a Participant ID.
_Avoid_: user, player, visitor

**Participant ID**:
A Participant's XMUM student ID, or an auto-issued **Guest ID** (`G001`, `G002`, …) for anyone without one.
_Avoid_: user ID

**Secretary**:
Staff at the front desk who registers Participants.
_Avoid_: admin, registrar

**Game Master**:
Staff who runs one Station and picks the Participant at the start of every Round.
_Avoid_: host, operator

### Event structure

**Station**:
One of the five booths, each running one game. Participants visit Stations in any order.
_Avoid_: booth (in code and docs), level

**Round**:
One Participant's single attempt at one Station, from the Game Master's start to the game's finish. A Participant may play several Rounds at a Station, but only one at a time per Station. Several Participants can each have a Round open at the same Station at once.
_Avoid_: session, attempt, play

**Cancelled Round**:
A Round the Game Master closes without a score (wrong player picked, phone trouble). It counts for nothing, and the Participant can start again.

**Station Score**:
A Participant's highest Round score at a Station, scaled to 0–100. Five Stations give a total out of 500.
_Avoid_: points (for the scaled value)

**Station PIN**:
A short code a Game Master enters once on their device so it can record Rounds for that Station.

### Visit lifecycle

**Registration**:
The Secretary records a new Participant: Participant ID, name, age group, whether they hold a Public Bank account, whether they or someone close has been targeted by a scam, and consent.

**Check-out**:
A Participant telling a Game Master they're leaving. The Game Master presses Leaving on their Station's start screen, which opens the Exit Survey on that device.
_Avoid_: logout, sign-out

**Exit Survey**:
The form a Participant fills at Check-out. Its questions depend on which Stations they completed.
_Avoid_: halfway form, feedback form

**Abandoned**:
A Participant with no Registration or Round end in the last 15 minutes and no Check-out. They leave no Exit Survey. Starting a new Round clears the label.

**Leaderboard**:
The live ranking of Participants by total Station Score, ties broken by the shortest total time of the best Rounds. It shows first name and the last 3 digits of the Participant ID. The top 3 who completed all five Stations and the Exit Survey win the prize.

### Station 5: Scan Me If You Can

**Board Number**:
One of the 25 numbered QR codes printed on the Station 5 board (#1–#25). A Board Number says nothing about any website: which Site Card is behind it is decided by each Round's Deal.

**Deal**:
The 8 Board Numbers a Station 5 Round uses and the Site Card behind each (3 Real, 5 Fake), drawn fresh for every Round. The same Board Number shows different Site Cards to different Participants.

**Site Card**:
One of the 25 website copies used at Station 5, shown inside the Sim Browser when a Participant scans a Board Number in their Deal. It is either **Real** (a genuine site at its true address, 10 cards) or **Fake** (an imitation using scam tactics, 15 cards). Public Bank, the sponsor, appears only as Real.
_Avoid_: QR site, link

**Sim Browser**:
The phone-browser simulation that shows every Site Card. It has an address bar, a padlock with certificate details, link previews on long-press, Back and Forward, and forms that never send anything.
_Avoid_: preview, iframe

**Verdict**:
A Participant's "Real" or "Fake" call on a Site Card, made before the card's 12-second timer runs out.

**Join QR**:
The code the Game Master's screen shows at the start of a Station 5 Round. Scanning it binds the Participant's phone to that Round.

## Relationships

- A **Participant** has many **Rounds**. Each **Round** belongs to one **Station**.
- A **Participant**'s **Station Score** comes from their best **Round** at that Station.
- An **Exit Survey** covers only the **Stations** where the Participant finished a **Round**.
- Only the **Secretary** creates **Participants**. Anyone unregistered at a **Station** goes back to the front desk.
- A Station 5 **Round** has one **Deal**: 8 **Board Numbers**, each showing one **Site Card**, and records one **Verdict** for each.

## Example dialogue

> **Game Master:** "She's already done Station 5. Can she go again?"
> **Secretary:** "Yes, start another Round. Only her best Station Score counts on the Leaderboard."

## Flagged ambiguities

- "Halfway form" and "exit survey" were both used. Resolved: there is one **Exit Survey**, shaped by the Stations completed.
- "User" meant Participant, Secretary, and Game Master in different places. Resolved: use those three terms.
