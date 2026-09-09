# Data Safety Form

Play Console → App content → Data safety. Answers below.

## Overview

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS to Supabase) |
| Do you provide a way for users to request that their data is deleted? | **Yes** — in-app (Settings → Clear All Data deletes the account and all server data) and via email contact |

## Data types collected

### Personal info → Name
- **Collected:** Yes (the optional player nickname users enter)
- **Shared with third parties:** No
- **Processed ephemerally:** No (persisted as part of game history)
- **Required or optional:** Optional (user-chosen nicknames; can be left blank or pseudonym)
- **Purposes:** App functionality (display in game history and leaderboards)

### Personal info → Email address
- **Collected:** Yes, optional (only if the user links an e-mail to keep their history across devices, or adds one to a feedback message)
- **Shared with third parties:** No
- **Processed ephemerally:** No
- **Required or optional:** Optional
- **Purposes:** Account management (sign-in codes to restore history on another device); App functionality (replying to feedback)

### App activity → App interactions
- **Collected:** Yes (card counts, scores, game outcomes)
- **Shared with third parties:** No
- **Processed ephemerally:** No
- **Required or optional:** Required (this is the core feature)
- **Purposes:** App functionality (score history, stats)

### Device or other IDs → Device or other IDs
- **Collected:** Yes (a random UUID generated on the device on first launch, plus a random anonymous account ID issued by Supabase Auth)
- **Shared with third parties:** No
- **Processed ephemerally:** No
- **Required or optional:** Required
- **Purposes:** App functionality (associate games with the device/account that recorded them)

## Data types you do NOT collect (leave unchecked)

- Personal info other than name and optional email (phone, address, etc.)
- Financial info
- Health and fitness
- Messages
- Photos / videos / audio
- Files and docs
- Calendar
- Contacts
- App info and performance (no crash reporting tools installed)
- Web browsing history
- Location

## Security practices

- ✅ Data is encrypted in transit (HTTPS)
- ✅ You can request that data be deleted
- ❌ Independent security review — not claimed
- ❌ Committed to follow Play Families Policy — not targeting children

## Account creation / deletion

The app lets users create an account (optional e-mail link). Play requires an in-app
deletion path plus a public web page describing it:

- **In-app:** Settings → Clear All Data deletes the account (auth user) and every game,
  player and score row it owns.
- **Web URL for the form:** `https://forest-shuffle-app.vercel.app/privacy` (section
  "Your choices and data deletion").

## User-deletion mechanism

In the form, when asked how users can request deletion, paste:

```
Users can delete their account and all associated data at any time from the app: Settings → Clear All Data removes the account, all games, players and scores from our servers and clears local storage. Users without the app can email lena.berw@gmail.com with the e-mail address linked to their account (or a description of the games to remove); requests are processed within a reasonable period. Uninstalling the app removes the locally cached records.
```
